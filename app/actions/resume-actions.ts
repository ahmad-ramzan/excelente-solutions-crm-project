'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { canManageCandidate } from '@/app/lib/candidate-access';

function revalidateCandidatePaths() {
  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/admin/candidates');
  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer');
}

export async function deleteResume(candidateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!(await canManageCandidate(supabase, user.id, candidateId))) {
    return { error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();

  const { data: resumeDocs } = await adminClient
    .from('candidate_documents')
    .select('id, file_path')
    .eq('candidate_id', candidateId)
    .eq('type', 'cv');

  if (!resumeDocs || resumeDocs.length === 0) {
    return { error: 'No resume found for this candidate' };
  }

  const { error: storageError } = await adminClient.storage
    .from('candidate-documents')
    .remove(resumeDocs.map((d) => d.file_path));

  if (storageError) {
    console.error('Resume storage delete error:', storageError);
    return { error: 'Failed to delete resume file' };
  }

  const { error: dbError } = await adminClient
    .from('candidate_documents')
    .delete()
    .in('id', resumeDocs.map((d) => d.id));

  if (dbError) {
    console.error('Resume DB delete error:', dbError);
    return { error: 'Failed to delete resume record' };
  }

  revalidateCandidatePaths();
  return { success: true };
}

export async function replaceResume(formData: FormData) {
  const candidateId = formData.get('candidateId') as string;
  const file = formData.get('file') as File;

  if (!candidateId || !file || file.size === 0) {
    return { error: 'A resume file is required' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!(await canManageCandidate(supabase, user.id, candidateId))) {
    return { error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();

  // Remove any existing resume(s) first so only one CV remains on file.
  const { data: existingDocs } = await adminClient
    .from('candidate_documents')
    .select('id, file_path')
    .eq('candidate_id', candidateId)
    .eq('type', 'cv');

  if (existingDocs && existingDocs.length > 0) {
    await adminClient.storage.from('candidate-documents').remove(existingDocs.map((d) => d.file_path));
    await adminClient.from('candidate_documents').delete().in('id', existingDocs.map((d) => d.id));
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `${candidateId}/cv-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // Admin client — "candidate-documents" is a private bucket with no storage
  // RLS policies, so the regular session-scoped client can't write to it.
  const { error: uploadError } = await adminClient.storage
    .from('candidate-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('Resume upload error:', uploadError);
    return { error: 'Failed to upload resume' };
  }

  const { error: dbError } = await adminClient.from('candidate_documents').insert({
    candidate_id: candidateId,
    type: 'cv',
    status: 'uploaded',
    file_path: filePath,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  if (dbError) {
    console.error('Resume DB insert error:', dbError);
    return { error: 'Failed to save resume record' };
  }

  revalidateCandidatePaths();
  return { success: true };
}
