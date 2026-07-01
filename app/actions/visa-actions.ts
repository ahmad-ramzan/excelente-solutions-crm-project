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

export async function reassignLawyer(visaCaseId: string, newLawyerId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: vc, error: fetchError } = await supabase
    .from('visa_cases')
    .select('status, candidate_id, candidates(first_name, last_name)')
    .eq('id', visaCaseId)
    .single();

  if (fetchError || !vc) {
    return { error: 'Visa case not found' };
  }

  const { error: updateError } = await supabase
    .from('visa_cases')
    .update({ lawyer_id: newLawyerId })
    .eq('id', visaCaseId);

  if (updateError) {
    console.error('Lawyer reassignment error:', updateError);
    return { error: 'Failed to reassign lawyer' };
  }

  await supabase.from('visa_case_events').insert({
    visa_case_id: visaCaseId,
    status: vc.status,
    remarks: 'Case reassigned to a different lawyer',
    changed_by: user.id,
  });

  const candidate: any = vc.candidates;
  const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'a candidate';

  await supabase.from('notifications').insert({
    recipient_id: newLawyerId,
    actor_id: user.id,
    type: 'visa_updated',
    title: 'Case assigned to you',
    body: `You've been assigned the visa case for ${candidateName}.`,
    entity_table: 'visa_cases',
    entity_id: visaCaseId,
  });

  revalidatePath(`/dashboard/admin/visas`);
  revalidatePath(`/dashboard/lawyer/cases`);

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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `${candidateId}/${docType}-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

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
