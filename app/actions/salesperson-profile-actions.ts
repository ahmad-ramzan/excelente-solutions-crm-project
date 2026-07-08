'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSalespersonProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const taxId = formData.get('taxId') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const zipCode = formData.get('zipCode') as string;
  const countryId = formData.get('countryId') as string;

  if (!name || !countryId) {
    return { error: 'Name and Country are required.' };
  }

  // First, update the full_name in the profiles meta_data
  await supabase.auth.updateUser({
    data: { full_name: name }
  });

  // Then, upsert the salesperson profile
  const { error: spError } = await supabase
    .from('salesperson_profiles')
    .upsert(
      {
        profile_id: user.id,
        address,
        city,
        zip_code: zipCode,
        country_id: countryId,
        phone,
        tax_id: taxId,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'profile_id' }
    );

  if (spError) {
    console.error('Salesperson profile update error:', spError);
    return { error: 'Failed to update profile. Please try again.' };
  }

  revalidatePath('/dashboard/salesperson/profile');
  return { success: true };
}
