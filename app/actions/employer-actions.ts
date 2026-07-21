'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type JobOfferInput = {
  employerId: string;
  countryId: string;
  positionId: string;
  staffNeeded: string;
  salaryAmount: string;
  startDate: string;
  endDate: string;
  cityOfEmployment: string;
  flightTicket: string;
  pickup: string;
  accommodation: string;
};

export async function createEmployer(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const outletName = formData.get('outletName') as string;
  const countryId = formData.get('countryId') as string;
  const contactName = formData.get('contactName') as string;
  const contactPosition = formData.get('contactPosition') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const zipCode = formData.get('zipCode') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('employers')
    .insert({
      name,
      outlet_name: outletName,
      country_id: countryId,
      assigned_salesperson_id: user.id, // Current salesperson
      contact_name: contactName,
      contact_position: contactPosition,
      email,
      phone,
      address,
      city,
      zip_code: zipCode,
      created_by: user.id,
      status: 'active'
    });

  if (error) {
    console.error('Employer insert error:', error);
    return { error: `Failed to create employer: ${error.message}` };
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
    return { error: `Failed to create job offer: ${error.message}` };
  }

  // The DB trigger `create_slots_after_job_offer_insert` will auto-create the slots

  revalidatePath('/dashboard/salesperson/orders');
  revalidatePath('/dashboard/employer/offers');
  return { success: true };
}

export async function createMultipleJobOffers(formData: FormData) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated. Please log in.' };

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    
    let offers: JobOfferInput[] = [];
    try {
      offers = JSON.parse((formData.get('offers') as string) || '[]') as JobOfferInput[];
    } catch {
      return { error: 'Invalid vacancy data submitted' };
    }

    if (!Array.isArray(offers) || offers.length === 0) {
      return { error: 'Add at least one vacancy position' };
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const uploadFiles = async (files: File[], folder: string) => {
      const paths: string[] = [];

      for (const file of files) {
        if (!file || file.size === 0) continue;

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
        }

        const ext = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filePath = `${folder}/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}${ext ? '' : '.bin'}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Use Admin Client to upload files so RLS on Storage does not block the upload
        const { createAdminClient } = await import('@/utils/supabase/admin');
        const adminClient = createAdminClient();

        const { error } = await adminClient.storage
          .from('contracts')
          .upload(filePath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (error) {
          console.error('Job offer file upload error:', error);
          throw new Error(`Failed to upload "${file.name}": ${error.message}`);
        }

        paths.push(filePath);
      }

      return paths;
    };

    // Validate each offer before inserting
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      if (!offer.employerId) return { error: `Vacancy ${i + 1}: Employer is missing.` };
      if (!offer.countryId) return { error: `Vacancy ${i + 1}: Country is missing.` };
      if (!offer.positionId) return { error: `Vacancy ${i + 1}: Please select a position.` };
      if (!offer.staffNeeded || parseInt(offer.staffNeeded) <= 0) return { error: `Vacancy ${i + 1}: Number of staff needed must be at least 1.` };
    }

    const insertData = offers.map(offer => ({
      employer_id: offer.employerId,
      country_id: offer.countryId,
      position_id: offer.positionId,
      staff_needed: parseInt(offer.staffNeeded),
      salary_amount: offer.salaryAmount ? parseFloat(offer.salaryAmount) : null,
      start_date: offer.startDate || null,
      end_date: offer.endDate || null,
      created_by: user.id,
      assigned_salesperson_id: callerProfile?.role === 'salesperson' ? user.id : null,
      status: 'open',
    }));

    const { data: insertedOffers, error } = await supabase
      .from('job_offers')
      .insert(insertData)
      .select('id');

    if (error) {
      console.error('Job offer insert error:', error);

      let msg = error.message;
      if (error.code === '23503') {
        msg = 'A referenced record (employer, country, or position) does not exist. Please check your selections.';
      } else if (error.code === '23505') {
        msg = 'A duplicate vacancy already exists with the same details.';
      } else if (error.code === '42501') {
        msg = 'Permission denied. Your account may not have access to create vacancies.';
      }

      return { error: `Failed to create vacancies: ${msg}` };
    }

    // Upload attachments to storage using admin client
    try {
      for (let index = 0; index < (insertedOffers || []).length; index += 1) {
        const offerId = insertedOffers[index].id;
        await uploadFiles(formData.getAll(`accommodationPhotos-${index}`) as File[], `job-offers/${offerId}/accommodation`);
        await uploadFiles(formData.getAll(`workplacePhotos-${index}`) as File[], `job-offers/${offerId}/workplace`);
        await uploadFiles(formData.getAll(`flightTicketPdf-${index}`) as File[], `job-offers/${offerId}/flight-tickets`);
        await uploadFiles(formData.getAll(`contractWithExcelente-${index}`) as File[], `job-offers/${offerId}/excelente-contracts`);
        await uploadFiles(formData.getAll(`additionalPdfs-${index}`) as File[], `job-offers/${offerId}/additional-pdfs`);
      }
    } catch (uploadError) {
      console.error('Attachment upload error:', uploadError);
      return { error: uploadError instanceof Error ? uploadError.message : 'Failed to upload vacancy attachments' };
    }

    revalidatePath('/dashboard/employer/offers');
    revalidatePath('/dashboard/employer/vacancies');
    revalidatePath('/dashboard/employer/selected');
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in createMultipleJobOffers:', err);
    return { error: err?.message || 'An unexpected server error occurred while creating vacancies' };
  }
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

export async function updateJobOffer(offerId: string, formData: FormData) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const positionId = formData.get('positionId') as string;
    const countryId = formData.get('countryId') as string;
    const staffNeededStr = formData.get('staffNeeded') as string;
    const salaryAmount = formData.get('salaryAmount') as string;
    const startDate = (formData.get('startDate') as string) || null;
    const endDate = (formData.get('endDate') as string) || null;
    const status = formData.get('status') as string || 'open';

    if (!positionId || !countryId || !staffNeededStr) {
      return { error: 'Position, Country, and Staff Needed are required fields.' };
    }

    const staffNeeded = parseInt(staffNeededStr, 10);
    if (isNaN(staffNeeded) || staffNeeded <= 0) {
      return { error: 'Staff needed must be a positive number.' };
    }

    const { error } = await supabase
      .from('job_offers')
      .update({
        position_id: positionId,
        country_id: countryId,
        staff_needed: staffNeeded,
        salary_amount: salaryAmount ? parseFloat(salaryAmount) : null,
        start_date: startDate,
        end_date: endDate,
        status: status,
      })
      .eq('id', offerId);

    if (error) {
      console.error('Update job offer error:', error);
      return { error: `Failed to update vacancy: ${error.message}` };
    }

    // Check existing slots to see if we need to add more vacant slots
    const { data: existingSlots } = await supabase
      .from('job_offer_slots')
      .select('slot_no')
      .eq('job_offer_id', offerId)
      .order('slot_no', { ascending: false });

    const currentCount = existingSlots?.length || 0;
    if (staffNeeded > currentCount) {
      const newSlots = [];
      for (let i = currentCount + 1; i <= staffNeeded; i++) {
        newSlots.push({
          job_offer_id: offerId,
          slot_no: i,
          status: 'vacant',
        });
      }
      await supabase.from('job_offer_slots').insert(newSlots);
    } else if (staffNeeded < currentCount) {
      // Delete excess vacant slots beyond the new staffNeeded count
      await supabase
        .from('job_offer_slots')
        .delete()
        .eq('job_offer_id', offerId)
        .eq('status', 'vacant')
        .gt('slot_no', staffNeeded);
    }

    revalidatePath('/dashboard/employer/offers');
    revalidatePath(`/dashboard/employer/offers/${offerId}`);
    revalidatePath('/dashboard/admin/offers');
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error updating job offer:', err);
    return { error: err?.message || 'An unexpected error occurred while updating the vacancy.' };
  }
}
