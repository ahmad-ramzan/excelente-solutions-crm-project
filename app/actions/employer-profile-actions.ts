'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateEmployerProfile(formData: FormData) {
  const supabase = await createClient();

  const employerId = formData.get('employerId') as string;
  const name = formData.get('name') as string;
  const outletName = formData.get('outletName') as string;
  const contactName = formData.get('contactName') as string;
  const contactPosition = formData.get('contactPosition') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const zipCode = formData.get('zipCode') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify the user actually belongs to this employer
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('id')
    .eq('profile_id', user.id)
    .eq('employer_id', employerId)
    .single();

  if (!employerUser) {
    return { error: 'Unauthorized to edit this employer profile' };
  }

  const { error } = await supabase
    .from('employers')
    .update({
      name,
      outlet_name: outletName,
      contact_name: contactName,
      contact_position: contactPosition,
      email,
      phone,
      address,
      city,
      zip_code: zipCode,
      updated_at: new Date().toISOString()
    })
    .eq('id', employerId);

  if (error) {
    console.error('Employer profile update error:', error);
    return { error: 'Failed to update profile' };
  }

  revalidatePath('/dashboard/employer/profile');
  return { success: true };
}
