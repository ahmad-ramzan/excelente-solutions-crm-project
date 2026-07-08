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
  const startDate = (formData.get('startDate') as string) || null;
  const endDate = (formData.get('endDate') as string) || null;
  const contractSigned = formData.get('contractSigned') === 'on';

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Server-side validation
  if (!employerId || !countryId || !positionId || isNaN(staffNeeded) || staffNeeded <= 0) {
    return { error: 'Invalid input' };
  }

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  const { error } = await supabase
    .from('job_offers')
    .insert({
      employer_id: employerId,
      country_id: countryId,
      position_id: positionId,
      staff_needed: staffNeeded,
      salary_amount: salaryAmount ? parseFloat(salaryAmount) : null,
      start_date: startDate,
      end_date: endDate,
      contract_signed: contractSigned,
      created_by: user.id,
      assigned_salesperson_id: callerProfile?.role === 'salesperson' ? user.id : null,
      status: 'open',
    });

  if (error) {
    console.error('Job offer insert error:', error);
    return { error: 'Failed to create job offer' };
  }

  // The DB trigger `create_slots_after_job_offer_insert` will auto-create the slots

  revalidatePath('/dashboard/salesperson/orders');
  revalidatePath('/dashboard/employer/offers');
  return { success: true };
}

export async function createMultipleJobOffers(offers: any[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  const insertData = offers.map(offer => ({
    employer_id: offer.employerId,
    country_id: offer.countryId,
    position_id: offer.positionId,
    staff_needed: offer.staffNeeded,
    salary_amount: offer.salaryAmount ? parseFloat(offer.salaryAmount) : null,
    start_date: offer.startDate || null,
    end_date: offer.endDate || null,
    city_of_employment: offer.cityOfEmployment || null,
    flight_ticket_provided: offer.flightTicket === 'true',
    pickup_at_airport: offer.pickup === 'true',
    accommodation_provided: offer.accommodation === 'true',
    created_by: user.id,
    assigned_salesperson_id: callerProfile?.role === 'salesperson' ? user.id : null,
    status: 'open',
  }));

  const { error } = await supabase
    .from('job_offers')
    .insert(insertData);

  if (error) {
    console.error('Job offer insert error:', error);
    return { error: 'Failed to create job offers' };
  }

  revalidatePath('/dashboard/employer/offers');
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

  // --- MOCK EMAIL NOTIFICATION ---
  // In a real environment, we'd use Resend, SendGrid, etc.
  console.log(`
  ===========================================
  EMAIL NOTIFICATION TRIGGERED
  To: Admin, Agent
  Subject: Candidate Selected!
  Body: Candidate ${candidateId} has been selected by Employer for Job Offer ${jobOfferId}.
  A signed contract has been uploaded.
  Please begin the visa process.
  ===========================================
  `);

  revalidatePath('/dashboard/employer/candidates');
  revalidatePath('/dashboard/employer/offers');
  revalidatePath('/dashboard/employer/selections');
  
  return { success: true, selectionId: data };
}
