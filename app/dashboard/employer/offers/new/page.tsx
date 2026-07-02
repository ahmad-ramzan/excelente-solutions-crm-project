import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientOfferForm from './ClientOfferForm';
import { createClient } from '@/utils/supabase/server';

export default async function EmployerNewJobOfferPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Find the employer record for this user
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .single();

  if (!employerUser) {
    return (
      <>
        <AppSidebar role="employer" />
        <div className="main">
          <AppTopbar section="New Job Offer" />
          <div className="wrap" style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
            You are not assigned to any employer account yet. Please contact support.
          </div>
        </div>
      </>
    );
  }

  // Fetch employer details
  const { data: employer } = await supabase
    .from('employers')
    .select('id, name, country_id, countries(name)')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;

  // Fetch all available positions
  const { data: positions } = await supabase
    .from('positions')
    .select('id, name')
    .order('name');

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="New Job Offer" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>New Job Offer</h1>
              <p className="ph-sub">Create a recruitment requirement. Position slots are generated automatically.</p>
            </div>
          </div>

          <div style={{ maxWidth: '800px', marginTop: '24px' }}>
            {/* Alert / Info Box */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              padding: '16px 20px', 
              background: '#fef7f2', 
              border: '1px solid #eec4a8', 
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#8b5cf6', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
                On save, the system <strong>auto-generates one position slot per staff member needed</strong> — e.g. 4 welders creates Welder Slot 1 through 4. Slots stay vacant until candidates are assigned.
              </div>
            </div>

            <ClientOfferForm 
              employerId={employer.id}
              employerName={employer.name}
              countryId={employer.country_id}
              countryName={(employer.countries as any)?.[0]?.name || (employer.countries as any)?.name || 'Unknown'}
              positions={positions || []}
            />

          </div>
        </div>
      </div>
    </>
  );
}
