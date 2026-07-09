'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateLawFirmProfile(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const lawFirmId = formData.get('lawFirmId') as string;
  const name = formData.get('name') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  if (!lawFirmId || !name) {
    return { error: 'Law Firm Name is required.' };
  }

  // Verify this user actually belongs to this law firm
  const { data: lfUser } = await adminClient
    .from('law_firm_users')
    .select('id')
    .eq('law_firm_id', lawFirmId)
    .eq('profile_id', user.id)
    .single();

  if (!lfUser) {
    return { error: 'Unauthorized to edit this Law Firm profile.' };
  }

  const { error } = await adminClient
    .from('law_firms')
    .update({
      name,
      contact_name: contactName,
      email,
      phone,
      address,
      updated_at: new Date().toISOString()
    })
    .eq('id', lawFirmId);

  if (error) {
    console.error('Law Firm profile update error:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }

  revalidatePath('/dashboard/lawyer/profile');
  return { success: true };
}
