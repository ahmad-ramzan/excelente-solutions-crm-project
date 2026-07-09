import { createAdminClient } from '@/utils/supabase/admin';

type ProvisionResult = {
  success: boolean;
  error?: string;
};

async function getCountryId(adminClient: ReturnType<typeof createAdminClient>, countryName?: string) {
  if (!countryName) return null;

  const { data } = await adminClient
    .from('countries')
    .select('id')
    .ilike('name', countryName)
    .maybeSingle();

  return data?.id || null;
}

function withCityZip(address?: string, city?: string, zipCode?: string) {
  return [address, [city, zipCode].filter(Boolean).join(' ')].filter(Boolean).join('\n') || null;
}

export async function autoProvisionEntityForActiveUser(userId: string): Promise<ProvisionResult> {
  const adminClient = createAdminClient();

  const [{ data: profile, error: profileError }, { data: userObj, error: userError }] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', userId).maybeSingle(),
    adminClient.auth.admin.getUserById(userId),
  ]);

  if (profileError || userError || !profile || !userObj?.user) {
    console.error('Auto provisioning failed to load user profile:', { profileError, userError, userId });
    return { success: false, error: 'User profile could not be loaded.' };
  }

  const role = profile.role;
  const meta = userObj.user.user_metadata || {};
  const companyName = meta.company_name || profile.full_name;
  const countryId = await getCountryId(adminClient, meta.country_name);
  const baseEntity = {
    name: companyName,
    country_id: countryId,
    contact_name: profile.full_name,
    email: profile.email,
    phone: meta.phone || profile.phone,
    address: withCityZip(meta.address, meta.city, meta.zip_code),
    created_by: userId,
  };

  if (role === 'employer') {
    const { data: existing } = await adminClient
      .from('employer_users')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (existing) return { success: true };
    if (!countryId) return { success: false, error: 'A country is required before this account can be linked.' };

    const { data: employer, error } = await adminClient
      .from('employers')
      .insert(baseEntity)
      .select('id')
      .single();

    if (error || !employer) return { success: false, error: error?.message || 'Employer profile could not be created.' };

    const { error: linkError } = await adminClient
      .from('employer_users')
      .insert({ employer_id: employer.id, profile_id: userId, is_primary: true, job_title: meta.position });

    return linkError ? { success: false, error: linkError.message } : { success: true };
  }

  if (role === 'lawyer') {
    const { data: existing } = await adminClient
      .from('law_firm_users')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (existing) return { success: true };
    if (!countryId) return { success: false, error: 'A country is required before this account can be linked.' };

    const { data: lawFirm, error } = await adminClient
      .from('law_firms')
      .insert(baseEntity)
      .select('id')
      .single();

    if (error || !lawFirm) return { success: false, error: error?.message || 'Law firm profile could not be created.' };

    const { error: linkError } = await adminClient
      .from('law_firm_users')
      .insert({ law_firm_id: lawFirm.id, profile_id: userId, is_primary: true, job_title: meta.position });

    if (linkError) return { success: false, error: linkError.message };

    await adminClient
      .from('lawyer_countries')
      .upsert(
        { lawyer_id: userId, country_id: countryId, is_primary: true },
        { onConflict: 'lawyer_id,country_id' }
      );

    return { success: true };
  }

  if (role === 'agent') {
    const { data: existing } = await adminClient
      .from('agency_users')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (existing) return { success: true };
    if (!countryId) return { success: false, error: 'A country is required before this account can be linked.' };

    const { data: agency, error } = await adminClient
      .from('agencies')
      .insert(baseEntity)
      .select('id')
      .single();

    if (error || !agency) return { success: false, error: error?.message || 'Agency profile could not be created.' };

    const { error: linkError } = await adminClient
      .from('agency_users')
      .insert({ agency_id: agency.id, profile_id: userId, is_primary: true, job_title: meta.position });

    return linkError ? { success: false, error: linkError.message } : { success: true };
  }

  if (role === 'salesperson') {
    const { data: existing } = await adminClient
      .from('salesperson_profiles')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();

    if (existing) return { success: true };

    const countryId = await getCountryId(adminClient, meta.country_name);
    const { error } = await adminClient.from('salesperson_profiles').insert({
      profile_id: userId,
      address: meta.address,
      city: meta.city,
      zip_code: meta.zip_code,
      country_id: countryId,
      tax_id: meta.tax_id,
    });

    return error ? { success: false, error: error.message } : { success: true };
  }

  return { success: true };
}
