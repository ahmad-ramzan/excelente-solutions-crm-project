'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { notifyAdmins, notifyUsers } from '@/app/lib/notifications';

export async function uploadLawyerDocument(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  const candidateId = formData.get('candidateId') as string;
  const type = formData.get('type') as string;

  if (!file || !candidateId || !type) {
    return { error: 'Missing required fields' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `${candidateId}/${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  // Admin client — "candidate-documents" is a private bucket with no storage
  // RLS policies, so the regular session-scoped client can't write to it.
  const { error: uploadError } = await adminClient.storage
    .from('candidate-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { error: 'Failed to upload file to storage' };
  }

  const { error: dbError } = await adminClient.from('candidate_documents').insert({
    candidate_id: candidateId,
    type,
    status: 'uploaded',
    file_path: filePath,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: user.id
  });

  if (dbError) {
    console.error('DB insert error:', dbError);
    return { error: 'Failed to save document record' };
  }

  // Visa document uploaded by the lawyer — notify the candidate's agent and admins.
  const { data: candidate } = await adminClient
    .from('candidates')
    .select('agent_id, first_name, last_name')
    .eq('id', candidateId)
    .maybeSingle();

  if (candidate) {
    const candidateName = `${candidate.first_name} ${candidate.last_name}`;
    const notifyOptions = {
      actorId: user.id,
      type: 'visa_updated' as const,
      title: 'Visa document uploaded',
      body: `A new ${type.replace(/_/g, ' ')} was uploaded for ${candidateName}.`,
      entityTable: 'candidates',
      entityId: candidateId,
    };
    await notifyUsers(adminClient, [candidate.agent_id], notifyOptions);
    await notifyAdmins(adminClient, notifyOptions);
  }

  revalidatePath('/dashboard/lawyer/search');
  revalidatePath('/dashboard/lawyer/cases');
  return { success: true };
}
