import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { autoProvisionEntityForActiveUser } from '@/app/lib/provisioning';
import AgencyProfileForm from './AgencyProfileForm';

export default async function AgencyProfilePage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the agency record for this user
  let { data: agencyUser } = await adminClient
    .from('agency_users')
    .select('agency_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!agencyUser) {
    await autoProvisionEntityForActiveUser(user.id);

    const { data: repairedAgencyUser } = await adminClient
      .from('agency_users')
      .select('agency_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    agencyUser = repairedAgencyUser;
  }

  if (!agencyUser) {
      // For now, if no agency is assigned, we just show a message.
      // An admin or registration flow would typically assign this.
      return (
        <>
          <AppSidebar role="agent" />
          <div className="main">
            <AppTopbar section="My Profile" />
            <div className="wrap">
              <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>Account Not Linked</h2>
                <p style={{ color: 'var(--slate)' }}>Your account has not been linked to an agency yet.</p>
              </div>
            </div>
          </div>
        </>
      );
  }

  // 2. Fetch agency details
  const { data: agency } = await adminClient
    .from('agencies')
    .select('id, name, contact_name, email, phone, address, country_id, countries(name)')
    .eq('id', agencyUser.agency_id)
    .maybeSingle();

  if (!agency) return null;

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="My Profile" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>My Agency Profile</h1>
              <p className="ph-sub">Manage your agency details and contact information.</p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', marginTop: '32px' }}>
            <AgencyProfileForm agency={agency} />
          </div>
        </div>
      </div>
    </>
  );
}
