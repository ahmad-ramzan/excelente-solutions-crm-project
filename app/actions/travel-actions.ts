'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

  revalidatePath('/dashboard/admin/visas');
  revalidatePath('/dashboard/salesperson/cases');

  return { success: true };
}
