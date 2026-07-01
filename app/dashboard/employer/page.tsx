import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { getDashboardStats } from '@/app/lib/queries';
import Link from 'next/link';

export default async function EmployerDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  const { data: employerUsers } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .limit(1);

  const employerUser = employerUsers?.[0];

  if (!employerUser) {
    return (
      <>
        <AppSidebar role="employer" />
        <div className="main">
          <AppTopbar section="Dashboard" />
          <div className="wrap">
            <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', marginTop: '40px' }}>
              <div style={{ width: '48px', height: '48px', background: '#f5f3ff', color: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Account Not Linked</h2>
              <p style={{ color: 'var(--slate)', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                Your account has not been linked to an employer profile yet. Please contact your salesperson or an administrator to complete your setup.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 2. Fetch employer details
  const { data: employer } = await supabase
    .from('employers')
    .select('id, name, country_id, countries(name)')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;
  const countryData = employer.countries as any;
  const countryName = (Array.isArray(countryData) ? countryData[0]?.name : countryData?.name) || 'Unknown';

  // 3. Fetch Stats
  const stats = await getDashboardStats(supabase, 'employer', employer.id);

  // 4. Fetch available candidates in this employer's country
  // The Employer can only see available candidates in their country.
  const { data: dbCandidates } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('status', 'available')
    .eq('country_name', countryName) // the view returns country_name
    .order('created_at', { ascending: false })
    .limit(5);

  const candidates = (dbCandidates || []).map((c: any) => {
    return {
      id: c.id,
      public_code: c.public_code,
      initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
      name: `${c.first_name} ${c.last_name}`,
      positions: c.positions || [],
      status: 'AVAILABLE',
      statusColor: '#475569',
      statusBg: '#f1f5f9'
    };
  });

  // 5. Fetch latest active job offer
  const { data: latestOffer } = await supabase
    .from('job_offers')
    .select('*, countries(name), positions(name)')
    .eq('employer_id', employer.id)
    .in('status', ['draft', 'open'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>{employer.name}</h1>
              <p className="ph-sub">Recruitment for your {countryName} operations.</p>
            </div>
          </div>

          {/* Info Alert Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            background: '#f5f3ff',
            border: '1px solid #e1d4fc',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--brand)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
            </div>
            <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
              You're viewing the <strong style={{ color: 'var(--ink)' }}>{countryName}</strong> market. You can only see candidates cleared for {countryName} — that keeps every shortlist relevant to your visas.
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>Total Job Offers</div>
              <div className="v" style={{ color: '#fff' }}>{stats.total_offers}</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Staff needed (Total slots)</div>
              <div className="v">{stats.total_slots}</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Active Selections</div>
              <div className="v" style={{ marginBottom: '8px' }}>{stats.active_selections}</div>
              <div style={{ color: 'var(--green)', fontSize: '12.5px', fontWeight: 600 }}>Total selections: {stats.total_selections}</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Available to view</div>
              <div className="v" style={{ marginBottom: '8px' }}>{dbCandidates?.length || 0}</div>
              <div style={{ color: 'var(--green)', fontSize: '12.5px', fontWeight: 600 }}>in {countryName}</div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
            {/* Left Column: Candidates */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Available candidates · {countryName}</h3>
                <Link href="/dashboard/employer/candidates">
                  <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>Browse all</span>
                </Link>
              </div>
              <div className="card-b" style={{ padding: '0 22px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>CANDIDATE</th>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>POSITIONS</th>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>STATUS</th>
                      <th style={{ padding: '16px 0', borderBottom: '1px solid var(--line-2)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: i === candidates.length - 1 ? 'none' : '1px solid var(--line)' }}>
                        <td style={{ padding: '16px 0' }}>
                          <div className="cell-name">
                            <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                              {c.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                              <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                                {c.public_code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 0' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {c.positions.map((p: string) => (
                              <span key={p} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px 0' }}>
                          <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                            • {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <Link href={`/dashboard/employer/candidates/${c.public_code}`}>
                              <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', marginRight: '8px' }}>View</span>
                            </Link>
                            <Link href={`/dashboard/employer/offers?select=${c.public_code}`}>
                              <button className="btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                Select
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)' }}>
                          No available candidates in {countryName} at the moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Order summary */}
            {latestOffer ? (
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Offer: {latestOffer.positions?.name || 'Various'} × {latestOffer.staff_needed}</h3>
                  <Link href={`/dashboard/employer/offers/${latestOffer.id}`}>
                    <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>View slots</span>
                  </Link>
                </div>
                <div className="card-b" style={{ padding: '24px' }}>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <span style={{ color: 'var(--slate)', fontSize: '13px', fontWeight: 600 }}>Slots</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, margin: '0 16px' }}>
                      <div style={{ width: '100%', height: '6px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: '0%', height: '100%', background: 'var(--brand)', borderRadius: '999px' }}></div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{latestOffer.staff_needed}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--slate)', fontSize: '13px' }}>Country</span>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{latestOffer.countries?.name}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--slate)', fontSize: '13px' }}>Status</span>
                      <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none', padding: '2px 8px', fontSize: '11px' }}>
                        • {latestOffer.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <Link href={`/dashboard/employer/offers/${latestOffer.id}`}>
                    <button className="btn" style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Manage offer
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card" style={{ height: 'fit-content' }}>
                <div className="card-h">
                  <h3 style={{ fontSize: '16px', fontWeight: 600 }}>No Active Offers</h3>
                </div>
                <div className="card-b" style={{ padding: '24px', textAlign: 'center', color: 'var(--slate)' }}>
                  You do not have any active job offers right now.
                  <div style={{ marginTop: '24px' }}>
                    <Link href="/dashboard/employer/offers/new">
                      <button className="btn" style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Create new offer
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
