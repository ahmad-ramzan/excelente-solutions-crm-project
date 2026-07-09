import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { autoProvisionEntityForActiveUser } from '@/app/lib/provisioning';
import LawFirmProfileForm from './LawFirmProfileForm';

export default async function LawFirmProfilePage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the law firm record for this user
  let { data: lfUser } = await adminClient
    .from('law_firm_users')
    .select('law_firm_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!lfUser) {
    await autoProvisionEntityForActiveUser(user.id);

    const { data: repairedLfUser } = await adminClient
      .from('law_firm_users')
      .select('law_firm_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    lfUser = repairedLfUser;
  }

  if (!lfUser) {
      return (
        <>
          <AppSidebar role="lawyer" />
          <div className="main">
            <AppTopbar section="My Profile" />
            <div className="wrap">
              <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '40px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>Account Not Linked</h2>
                <p style={{ color: 'var(--slate)' }}>Your account has not been linked to a Law Firm yet.</p>
              </div>
            </div>
          </div>
        </>
      );
  }

  // 2. Fetch law firm details
  const { data: lawFirm } = await adminClient
    .from('law_firms')
    .select('id, name, contact_name, email, phone, address, country_id, countries(name)')
    .eq('id', lfUser.law_firm_id)
    .maybeSingle();

  if (!lawFirm) return null;

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="My Profile" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>My Law Firm Profile</h1>
              <p className="ph-sub">Manage your law firm details and contact information.</p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', marginTop: '32px' }}>
            <LawFirmProfileForm lawFirm={lawFirm} />
          </div>
        </div>
      </div>
    </>
  );
}
