'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadCandidateDocument(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const file = formData.get('file') as File;
  const candidateId = formData.get('candidateId') as string;
  const type = formData.get('type') as string;

  if (!file || !candidateId || !type) {
    return { error: 'Missing required fields' };
  }

  // Verify the candidate belongs to this agent
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', candidateId)
    .eq('agent_id', user.id)
    .single();

  if (!candidate) {
    return { error: 'Unauthorized or candidate not found' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const filePath = `${candidateId}/${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return { error: 'Failed to upload file to storage' };
  }

  const { error: dbError } = await supabase.from('candidate_documents').insert({
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

  revalidatePath('/dashboard/agent/selected');
  return { success: true };
}
