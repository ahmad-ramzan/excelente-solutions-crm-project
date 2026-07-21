'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { autoProvisionEntityForActiveUser as provisionEntityForActiveUser } from '@/app/lib/provisioning';
import { revalidatePath } from 'next/cache';

const CREATABLE_ROLES = ['admin', 'salesperson', 'agent', 'employer', 'lawyer'];

export async function createUserByAdmin(formData: FormData) {
  const supabase = await createClient();

  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { error: 'Not authenticated' };

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', caller.id).single();
  if (callerProfile?.role !== 'admin') return { error: 'Only admins can create users' };

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;

  if (!email || !password || !fullName || !role) {
    return { error: 'All fields are required' };
  }

  if (role !== 'admin' && !phone) {
    return { error: 'Phone / WhatsApp number is required.' };
  }

  if (!CREATABLE_ROLES.includes(role)) {
    return { error: 'Invalid role selected' };
  }

  const metadata: Record<string, string> = {
    full_name: fullName,
    role,
  };
  if (role !== 'admin') {
    metadata.phone = phone;
  }

  if (role === 'employer') {
    const companyName = formData.get('companyName') as string;
    const country = formData.get('country') as string;
    const outletName = formData.get('outletName') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zipCode = formData.get('zipCode') as string;
    const position = formData.get('position') as string;

    if (!companyName || !country || !outletName || !address || !city || !zipCode || !position) {
      return { error: 'All employer fields are required.' };
    }

    metadata.company_name = companyName;
    metadata.country_name = country;
    metadata.outlet_name = outletName;
    metadata.address = address;
    metadata.city = city;
    metadata.zip_code = zipCode;
    metadata.position = position;
  }

  if (role === 'agent' || role === 'lawyer') {
    const country = formData.get('country') as string;
    const companyName = formData.get('companyName') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zipCode = formData.get('zipCode') as string;
    const position = formData.get('position') as string;

    if (!companyName || !country || !address || !city || !zipCode || !position) {
      return { error: `All ${role} fields are required.` };
    }

    metadata.country_name = country;
    metadata.company_name = companyName;
    metadata.address = address;
    metadata.city = city;
    metadata.zip_code = zipCode;
    metadata.position = position;
  }

  if (role === 'salesperson') {
    const country = formData.get('country') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zipCode = formData.get('zipCode') as string;
    const taxId = formData.get('taxId') as string;

    if (!country || !address || !city || !zipCode || !taxId) {
      return { error: 'All salesperson fields are required.' };
    }

    metadata.country_name = country;
    metadata.address = address;
    metadata.city = city;
    metadata.zip_code = zipCode;
    metadata.tax_id = taxId;
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    console.error('Admin create user error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}

export async function createCountry(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const code = (formData.get('code') as string).toUpperCase();

  const { error } = await supabase.from('countries').insert({ name, code });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/countries');
  return { success: true };
}

export async function updateCountry(countryId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const code = (formData.get('code') as string).toUpperCase();
  const isActive = formData.get('isActive') === 'on';

  const { error } = await supabase
    .from('countries')
    .update({ name, code, is_active: isActive })
    .eq('id', countryId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/countries');
  return { success: true };
}

export async function createPosition(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;

  const { error } = await supabase.from('positions').insert({ name });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/positions');
  return { success: true };
}

export async function updatePosition(positionId: string, formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const isActive = formData.get('isActive') === 'on';

  const { error } = await supabase
    .from('positions')
    .update({ name, is_active: isActive })
    .eq('id', positionId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/positions');
  return { success: true };
}

export async function assignSalesperson(employerId: string, salespersonId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('employers')
    .update({ assigned_salesperson_id: salespersonId || null })
    .eq('id', employerId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/admin/employers');
  revalidatePath('/dashboard/salesperson/employers');
  revalidatePath('/dashboard/salesperson/orders');
  return { success: true };
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) return { error: error.message };

  if (newStatus === 'active') {
    await autoProvisionEntityForActiveUser(userId);
  }

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}

export async function updateUserRoleStatus(userId: string, formData: FormData) {
  const supabase = await createClient();
  const role = formData.get('role') as string;
  const status = formData.get('status') as string;

  const { error } = await supabase
    .from('profiles')
    .update({ role, status })
    .eq('id', userId);

  if (error) return { error: error.message };

  if (status === 'active') {
    await autoProvisionEntityForActiveUser(userId);
  }

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}

export async function autoProvisionEntityForActiveUser(userId: string) {
  await provisionEntityForActiveUser(userId);
}

export async function getActiveCountries() {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('countries')
    .select('*')
    .eq('is_active', true)
    .order('name');
  return data || [];
}
