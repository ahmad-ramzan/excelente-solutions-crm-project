'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateAgencyProfile(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const agencyId = formData.get('agencyId') as string;
  const name = formData.get('name') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify the user actually belongs to this agency
  const { data: agencyUser } = await adminClient
    .from('agency_users')
    .select('id')
    .eq('profile_id', user.id)
    .eq('agency_id', agencyId)
    .single();

  if (!agencyUser) {
    return { error: 'Unauthorized to edit this agency profile' };
  }

  const { error } = await adminClient
    .from('agencies')
    .update({
      name,
      contact_name: contactName,
      email,
      phone,
      address,
      updated_at: new Date().toISOString()
    })
    .eq('id', agencyId);

  if (error) {
    console.error('Agency profile update error:', error);
    return { error: 'Failed to update profile' };
  }

  revalidatePath('/dashboard/agent/profile');
  return { success: true };
}
