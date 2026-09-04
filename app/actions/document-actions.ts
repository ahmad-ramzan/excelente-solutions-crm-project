'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { canManageCandidate, getUserRole } from '@/app/lib/candidate-access';
import { notifyAdmins, notifyUsers, getCaseAssignees } from '@/app/lib/notifications';

// Visa documents are uploaded by lawyers and reviewed by admins — agents may
// view/download them but must not be able to edit or delete them.
const VISA_DOCUMENT_TYPES = new Set(['visa_application_slip', 'approved_visa']);

async function canManageDocument(supabase: any, userId: string, candidateId: string, docType: string) {
  if (VISA_DOCUMENT_TYPES.has(docType)) {
    return (await getUserRole(supabase, userId)) === 'admin';
  }
  return canManageCandidate(supabase, userId, candidateId);
}

async function notifyDocumentChange(adminClient: any, actorId: string, candidateId: string, docType: string, action: 'deleted' | 'replaced') {
  const { data: candidate } = await adminClient.from('candidates').select('agent_id, first_name, last_name').eq('id', candidateId).maybeSingle();
  const { lawyerId } = await getCaseAssignees(adminClient, candidateId);
  const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'a candidate';
  const docLabel = docType.replace(/_/g, ' ');

  const options = {
    actorId,
    type: 'visa_updated' as const,
    title: action === 'deleted' ? 'Document deleted' : 'Document replaced',
    body: `${docLabel} for ${candidateName} was ${action}.`,
    entityTable: 'candidates',
    entityId: candidateId,
  };
  await notifyUsers(adminClient, [candidate?.agent_id, lawyerId], options);
  await notifyAdmins(adminClient, options);
}

function revalidateCandidatePaths() {
  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');
}

export async function deleteCandidateDocument(documentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const adminClient = createAdminClient();

  const { data: doc } = await adminClient
    .from('candidate_documents')
    .select('id, candidate_id, type, file_path')
    .eq('id', documentId)
    .single();

  if (!doc) return { error: 'Document not found' };

  if (!(await canManageDocument(supabase, user.id, doc.candidate_id, doc.type))) {
    return { error: 'Unauthorized' };
  }

  const { error: storageError } = await adminClient.storage
    .from('candidate-documents')
    .remove([doc.file_path]);

  if (storageError) {
    console.error('Document storage delete error:', storageError);
    return { error: 'Failed to delete document file' };
  }

  const { error: dbError } = await adminClient
    .from('candidate_documents')
    .delete()
    .eq('id', documentId);

  if (dbError) {
    console.error('Document DB delete error:', dbError);
    return { error: 'Failed to delete document record' };
  }

  await notifyDocumentChange(adminClient, user.id, doc.candidate_id, doc.type, 'deleted');

  revalidateCandidatePaths();
  return { success: true };
}

export async function replaceCandidateDocument(documentId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { error: 'A file is required' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const adminClient = createAdminClient();

  const { data: doc } = await adminClient
    .from('candidate_documents')
    .select('id, candidate_id, type, file_path')
    .eq('id', documentId)
    .single();

  if (!doc) return { error: 'Document not found' };

  if (!(await canManageDocument(supabase, user.id, doc.candidate_id, doc.type))) {
    return { error: 'Unauthorized' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `${doc.candidate_id}/${doc.type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // Admin client — "candidate-documents" is a private bucket with no storage
  // RLS policies, so the regular session-scoped client can't write to it.
  const { error: uploadError } = await adminClient.storage
    .from('candidate-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('Document upload error:', uploadError);
    return { error: 'Failed to upload document' };
  }

  const { error: updateError } = await adminClient
    .from('candidate_documents')
    .update({
      file_path: filePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id,
    })
    .eq('id', documentId);

  if (updateError) {
    console.error('Document DB update error:', updateError);
    return { error: 'Failed to update document record' };
  }

  // Only remove the old file once the DB row points at the new one.
  await adminClient.storage.from('candidate-documents').remove([doc.file_path]);

  await notifyDocumentChange(adminClient, user.id, doc.candidate_id, doc.type, 'replaced');

  revalidateCandidatePaths();
  return { success: true };
}
