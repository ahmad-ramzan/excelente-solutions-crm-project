'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEmployer(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const countryId = formData.get('countryId') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('employers')
    .insert({
      name,
      country_id: countryId,
      assigned_salesperson_id: user.id, // Current salesperson
      contact_name: contactName,
      email,
      phone,
      address,
      created_by: user.id,
      status: 'active'
    });

  if (error) {
    console.error('Employer insert error:', error);
    return { error: 'Failed to create employer' };
  }

  revalidatePath('/dashboard/salesperson/employers');
  return { success: true };
}

export async function createJobOffer(formData: FormData) {
  const supabase = await createClient();

  const employerId = formData.get('employerId') as string;
  const countryId = formData.get('countryId') as string;
  const positionId = formData.get('positionId') as string;
  const staffNeeded = parseInt(formData.get('staffNeeded') as string, 10);
  const salaryAmount = formData.get('salaryAmount') as string;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Server-side validation
  if (!employerId || !countryId || !positionId || isNaN(staffNeeded) || staffNeeded <= 0) {
    return { error: 'Invalid input' };
  }

  const { error } = await supabase
    .from('job_offers')
    .insert({
      employer_id: employerId,
      country_id: countryId,
      position_id: positionId,
      staff_needed: staffNeeded,
      salary_amount: salaryAmount ? parseFloat(salaryAmount) : null,
      created_by: user.id,
      status: 'open',
    });

  if (error) {
    console.error('Job offer insert error:', error);
    return { error: 'Failed to create job offer' };
  }

  // The DB trigger `create_slots_after_job_offer_insert` will auto-create the slots

  revalidatePath('/dashboard/salesperson/orders');
  revalidatePath('/dashboard/employer/orders');
  return { success: true };
}

export async function selectCandidate(jobOfferId: string, candidateId: string) {
  const supabase = await createClient();

  // Call the atomic RPC defined in the schema
  const { data, error } = await supabase.rpc('select_candidate_for_job_offer', {
    p_job_offer_id: jobOfferId,
    p_candidate_id: candidateId,
  });

  if (error) {
    console.error('Candidate selection error:', error);
    return { error: error.message || 'Failed to select candidate' };
  }

  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer/orders');
  revalidatePath('/dashboard/employer/selections');
  
  return { success: true, selectionId: data };
}
