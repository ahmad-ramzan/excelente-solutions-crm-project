import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import EmployerProfileForm from './EmployerProfileForm';

export default async function EmployerProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .single();

  if (!employerUser) return null;

  // 2. Fetch employer details
  const { data: employer } = await supabase
    .from('employers')
    .select('id, name, outlet_name, contact_name, contact_position, email, phone, address, city, zip_code, country_id, countries(name)')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="My Profile" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>My Profile</h1>
              <p className="ph-sub">Manage your company details and contact information.</p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', marginTop: '32px' }}>
            <EmployerProfileForm employer={employer} />
          </div>
        </div>
      </div>
    </>
  );
}
