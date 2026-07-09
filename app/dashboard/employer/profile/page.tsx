import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { autoProvisionEntityForActiveUser } from '@/app/lib/provisioning';
import EmployerProfileForm from './EmployerProfileForm';

export default async function EmployerProfilePage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  let { data: employerUser } = await adminClient
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!employerUser) {
    await autoProvisionEntityForActiveUser(user.id);

    const { data: repairedEmployerUser } = await adminClient
      .from('employer_users')
      .select('employer_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    employerUser = repairedEmployerUser;
  }

  if (!employerUser) {
    return (
      <>
        <AppSidebar role="employer" />
        <div className="main">
          <AppTopbar section="My Profile" />
          <div className="wrap">
            <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>Account Not Linked</h2>
              <p style={{ color: 'var(--slate)' }}>Your account has not been linked to an employer profile yet.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2. Fetch employer details
  const { data: employer } = await adminClient
    .from('employers')
    .select('id, name, contact_name, email, phone, address, country_id, countries(name)')
    .eq('id', employerUser.employer_id)
    .maybeSingle();

  if (!employer) {
    return (
      <>
        <AppSidebar role="employer" />
        <div className="main">
          <AppTopbar section="My Profile" />
          <div className="wrap">
            <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>Profile Missing</h2>
              <p style={{ color: 'var(--slate)' }}>The linked employer profile could not be found.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

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
