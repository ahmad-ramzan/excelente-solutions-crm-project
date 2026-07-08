import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import SalespersonProfileForm from './SalespersonProfileForm';

export default async function SalespersonProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch the basic profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, raw_user_meta_data')
    .eq('id', user.id)
    .single();

  // Fetch or setup salesperson specific info
  const { data: spProfile } = await supabase
    .from('salesperson_profiles')
    .select('*, countries(name)')
    .eq('profile_id', user.id)
    .maybeSingle();

  // Fetch all countries for the dropdown
  const { data: countries } = await supabase.from('countries').select('id, name').order('name');

  const combinedData = {
    id: user.id,
    email: profile?.email,
    name: profile?.raw_user_meta_data?.full_name || '',
    address: spProfile?.address || '',
    city: spProfile?.city || '',
    zip_code: spProfile?.zip_code || '',
    country_id: spProfile?.country_id || '',
    phone: spProfile?.phone || '',
    tax_id: spProfile?.tax_id || ''
  };

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="My Profile" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>My Salesperson Profile</h1>
              <p className="ph-sub">Manage your contact details and tax information.</p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', marginTop: '32px' }}>
            <SalespersonProfileForm profile={combinedData} countries={countries || []} />
          </div>
        </div>
      </div>
    </>
  );
}
