'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { notifyAdmins, notifyUsers } from '@/app/lib/notifications';

export async function updateVisaStatus(formData: FormData) {
  const supabase = await createClient();

  const visaCaseId = formData.get('visaCaseId') as string;
  const newStatus = formData.get('status') as string;
  const remarks = formData.get('remarks') as string;
  const applicationReference = (formData.get('applicationReference') as string) || null;
  const embassyAppointmentAt = (formData.get('embassyAppointmentAt') as string) || null;
  const expectedDecisionDate = (formData.get('expectedDecisionDate') as string) || null;
  const legalNotes = (formData.get('legalNotes') as string) || null;
  const rejectionReason = (formData.get('rejectionReason') as string) || null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: vc } = await supabase
    .from('visa_cases')
    .select('agent_id, candidate_id, selection_id, candidates(first_name, last_name)')
    .eq('id', visaCaseId)
    .single();

  // Update case status
  const { error: updateError } = await supabase
    .from('visa_cases')
    .update({
      status: newStatus,
      remarks,
      application_reference: applicationReference,
      embassy_appointment_at: embassyAppointmentAt,
      expected_decision_date: expectedDecisionDate,
      legal_notes: legalNotes,
      rejection_reason: newStatus === 'rejected' ? rejectionReason : null,
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

  const candidate: any = vc?.candidates;
  const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'a candidate';

  // Use admin client for cross-table status updates and notification lookups —
  // the lawyer's RLS only allows SELECT on candidates/selections/slots and their
  // own profile, so these must bypass RLS via the service-role client.
  const adminSupabase = createAdminClient();

  // Missing/additional documents needed — notify agent and all admins
  if (vc && (newStatus === 'documents_requested' || newStatus === 'additional_documents_requested')) {
    await notifyUsers(adminSupabase, [vc.agent_id], {
      actorId: user.id,
      type: 'document_requested',
      title: 'Documents needed',
      body: remarks
        ? `${candidateName}'s visa case needs documents: ${remarks}`
        : `${candidateName}'s visa case needs additional documents.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
    await notifyAdmins(adminSupabase, {
      actorId: user.id,
      type: 'document_requested',
      title: 'Documents needed',
      body: remarks
        ? `${candidateName}'s visa case needs documents: ${remarks}`
        : `${candidateName}'s visa case needs additional documents.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
  }

  // If approved, update candidate status, selection status, slot status, and notify
  if (newStatus === 'approved' && vc) {
    await adminSupabase.from('candidates').update({ status: 'approved' }).eq('id', vc.candidate_id);

    const { data: selection } = await adminSupabase
      .from('job_offer_selections')
      .update({ status: 'approved' })
      .eq('id', vc.selection_id)
      .select('employer_id, slot_id')
      .single();

    // Also mark the slot as 'filled' now that the visa is approved
    if (selection?.slot_id) {
      await adminSupabase
        .from('job_offer_slots')
        .update({ status: 'filled', filled_at: new Date().toISOString() })
        .eq('id', selection.slot_id);
    }

    const { data: employerUsers } = selection
      ? await adminSupabase.from('employer_users').select('profile_id').eq('employer_id', selection.employer_id)
      : { data: [] as { profile_id: string }[] };

    const recipients = [vc.agent_id, ...(employerUsers || []).map(eu => eu.profile_id)];

    await notifyUsers(adminSupabase, recipients, {
      actorId: user.id,
      type: 'visa_approved',
      title: 'Visa approved',
      body: `${candidateName}'s visa has been approved.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
    await notifyAdmins(adminSupabase, {
      actorId: user.id,
      type: 'visa_approved',
      title: 'Visa approved',
      body: `${candidateName}'s visa has been approved.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
  }

  // If rejected, update candidate and selection statuses too
  if (newStatus === 'rejected' && vc) {
    await adminSupabase.from('candidates').update({ status: 'rejected' }).eq('id', vc.candidate_id);

    const { data: selection } = await adminSupabase
      .from('job_offer_selections')
      .update({ status: 'rejected' })
      .eq('id', vc.selection_id)
      .select('employer_id, slot_id')
      .single();

    // Free the slot back to 'vacant' so it can be filled by another candidate
    if (selection?.slot_id) {
      await adminSupabase
        .from('job_offer_slots')
        .update({ status: 'vacant', candidate_id: null, reserved_at: null, filled_at: null })
        .eq('id', selection.slot_id);
    }

    await notifyUsers(adminSupabase, [vc.agent_id], {
      actorId: user.id,
      type: 'visa_updated',
      title: 'Visa rejected',
      body: rejectionReason ? `${candidateName}'s visa was rejected: ${rejectionReason}` : `${candidateName}'s visa was rejected.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
    await notifyAdmins(adminSupabase, {
      actorId: user.id,
      type: 'visa_updated',
      title: 'Visa rejected',
      body: rejectionReason ? `${candidateName}'s visa was rejected: ${rejectionReason}` : `${candidateName}'s visa was rejected.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
  }

  // Any other status transition not covered above — still let the agent and
  // admins know the case moved, just with a generic message.
  const notifiedStatuses = new Set(['documents_requested', 'additional_documents_requested', 'approved', 'rejected']);
  if (vc && !notifiedStatuses.has(newStatus)) {
    await notifyUsers(adminSupabase, [vc.agent_id], {
      actorId: user.id,
      type: 'visa_updated',
      title: 'Visa case updated',
      body: `${candidateName}'s visa case status changed to "${newStatus.replace(/_/g, ' ')}".`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
    await notifyAdmins(adminSupabase, {
      actorId: user.id,
      type: 'visa_updated',
      title: 'Visa case updated',
      body: `${candidateName}'s visa case status changed to "${newStatus.replace(/_/g, ' ')}".`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
  }

  revalidatePath(`/dashboard/lawyer/cases/${visaCaseId}`);
  revalidatePath('/dashboard/lawyer/cases');
  revalidatePath('/dashboard/lawyer');
  revalidatePath('/dashboard/admin/visas');
  revalidatePath('/dashboard/agent');
  revalidatePath('/dashboard/agent/candidates');
  revalidatePath('/dashboard/employer');
  revalidatePath('/dashboard/employer/selections');
  revalidatePath('/dashboard/employer/candidates');

  return { success: true };
}

export async function reassignLawyer(visaCaseId: string, newLawyerId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: vc, error: fetchError } = await supabase
    .from('visa_cases')
    .select('status, candidate_id, agent_id, candidates(first_name, last_name)')
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

  if (vc.agent_id && vc.agent_id !== user.id) {
    await supabase.from('notifications').insert({
      recipient_id: vc.agent_id,
      actor_id: user.id,
      type: 'visa_updated',
      title: 'Lawyer reassigned',
      body: `${candidateName}'s visa case now has a new lawyer.`,
      entity_table: 'visa_cases',
      entity_id: visaCaseId,
    });
  }

  revalidatePath(`/dashboard/admin/visas`);
  revalidatePath(`/dashboard/lawyer/cases`);

  return { success: true };
}

export async function uploadVisaDocument(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

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

  // Record document in DB
  const { error: dbError } = await adminClient.from('candidate_documents').insert({
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

  // An agent uploaded a document for the case — let the assigned lawyer and
  // admins know, since they're the ones waiting on it.
  if (visaCaseId) {
    const { data: vc } = await adminClient
      .from('visa_cases')
      .select('lawyer_id, candidates(first_name, last_name)')
      .eq('id', visaCaseId)
      .maybeSingle();

    const candidate: any = vc?.candidates;
    const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'A candidate';

    await notifyUsers(adminClient, [vc?.lawyer_id], {
      actorId: user.id,
      type: 'visa_updated',
      title: 'New document uploaded',
      body: `A new ${docType.replace(/_/g, ' ')} was uploaded for ${candidateName}.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
    await notifyAdmins(adminClient, {
      actorId: user.id,
      type: 'visa_updated',
      title: 'New document uploaded',
      body: `A new ${docType.replace(/_/g, ' ')} was uploaded for ${candidateName}.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });

    revalidatePath(`/dashboard/lawyer/cases/${visaCaseId}`);
  }
  revalidatePath('/dashboard/agent/candidates');

  return { success: true };
}
