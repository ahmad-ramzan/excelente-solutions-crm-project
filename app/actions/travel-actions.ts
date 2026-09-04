'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { notifyUsers, getEmployerUserIds } from '@/app/lib/notifications';

export async function upsertTravelDetails(formData: FormData) {
  const supabase = await createClient();

  const visaCaseId = formData.get('visaCaseId') as string;
  const ticketBooked = formData.get('ticketBooked') === 'on';
  const travelDate = (formData.get('travelDate') as string) || null;
  const arrivalDate = (formData.get('arrivalDate') as string) || null;
  const employerJoiningDate = (formData.get('employerJoiningDate') as string) || null;
  const notes = (formData.get('notes') as string) || null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('visa_case_travel')
    .upsert(
      {
        visa_case_id: visaCaseId,
        ticket_booked: ticketBooked,
        travel_date: travelDate,
        arrival_date: arrivalDate,
        employer_joining_date: employerJoiningDate,
        notes,
        coordinated_by: user.id,
      },
      { onConflict: 'visa_case_id' }
    );

  if (error) {
    console.error('Travel details update error:', error);
    return { error: 'Failed to save travel details' };
  }

  const adminClient = createAdminClient();
  const { data: vc } = await adminClient
    .from('visa_cases')
    .select('agent_id, selection_id, candidates(first_name, last_name)')
    .eq('id', visaCaseId)
    .maybeSingle();

  if (vc) {
    const candidate: any = vc.candidates;
    const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'A candidate';

    const { data: selection } = vc.selection_id
      ? await adminClient.from('job_offer_selections').select('employer_id').eq('id', vc.selection_id).maybeSingle()
      : { data: null };
    const employerUserIds = selection ? await getEmployerUserIds(adminClient, selection.employer_id) : [];

    await notifyUsers(adminClient, [vc.agent_id, ...employerUserIds], {
      actorId: user.id,
      type: 'order_milestone',
      title: ticketBooked ? 'Travel ticket booked' : 'Travel details updated',
      body: ticketBooked
        ? `${candidateName}'s travel ticket has been booked${travelDate ? ` for ${travelDate}` : ''}.`
        : `${candidateName}'s travel details were updated.`,
      entityTable: 'visa_cases',
      entityId: visaCaseId,
    });
  }

  revalidatePath('/dashboard/admin/visas');
  revalidatePath('/dashboard/salesperson/cases');

  return { success: true };
}
