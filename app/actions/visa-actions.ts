'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateVisaStatus(formData: FormData) {
  const supabase = await createClient();
  
  const visaCaseId = formData.get('visaCaseId') as string;
  const newStatus = formData.get('status') as string;
  const remarks = formData.get('remarks') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Update case status
  const { error: updateError } = await supabase
    .from('visa_cases')
    .update({ 
      status: newStatus, 
      remarks,
      ...(newStatus === 'submitted' ? { submitted_at: new Date().toISOString() } : {}),
      ...(newStatus === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      ...(newStatus === 'closed' || newStatus === 'rejected' ? { closed_at: new Date().toISOString() } : {}),
    })
    .eq('id', visaCaseId);

  if (updateError) {
    console.error('Visa case update error:', updateError);
    return { error: 'Failed to update visa case status' };
  }

  // Insert event
  await supabase
    .from('visa_case_events')
    .insert({
      visa_case_id: visaCaseId,
      status: newStatus,
      remarks,
      changed_by: user.id
    });

  // If approved, update candidate status as well
  if (newStatus === 'approved') {
    // get candidate id
    const { data: vc } = await supabase.from('visa_cases').select('candidate_id, selection_id').eq('id', visaCaseId).single();
    if (vc) {
      await supabase.from('candidates').update({ status: 'approved' }).eq('id', vc.candidate_id);
      await supabase.from('job_offer_selections').update({ status: 'approved' }).eq('id', vc.selection_id);
    }
  }

  revalidatePath(`/dashboard/lawyer/cases/${visaCaseId}`);
  revalidatePath('/dashboard/lawyer/cases');
  
  return { success: true };
}

export async function uploadVisaDocument(formData: FormData) {
  const supabase = await createClient();

  const visaCaseId = formData.get('visaCaseId') as string;
  const candidateId = formData.get('candidateId') as string;
  const docType = formData.get('type') as string;
  const file = formData.get('file') as File;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!file || file.size === 0) return { error: 'No file provided' };

  const filePath = `${candidateId}/${docType}-${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Document upload error:', uploadError);
    return { error: 'Failed to upload document' };
  }

  // Record document in DB
  const { error: dbError } = await supabase.from('candidate_documents').insert({
    candidate_id: candidateId,
    type: docType,
    status: 'uploaded',
    file_path: filePath,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: user.id
  });

  if (dbError) {
    console.error('Document DB insert error:', dbError);
    return { error: 'Failed to save document metadata' };
  }

  revalidatePath(`/dashboard/lawyer/cases/${visaCaseId}`);
  
  return { success: true };
}
