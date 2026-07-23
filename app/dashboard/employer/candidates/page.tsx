import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function EmployerCandidatesPage({ searchParams }: { searchParams: Promise<{ position?: string, q?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div style={{ padding: 40 }}>Not logged in</div>;

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
          <AppTopbar section="Browse candidates" />
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
  const { data: employer, error: eError } = await supabase
    .from('employers')
    .select('id, name, country_id, countries(name, code)')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return <div style={{ padding: 40 }}>Employer details not found. Error: {eError?.message}</div>;
  const countries: any = employer.countries;
  const countryName = Array.isArray(countries) ? countries[0]?.name : countries?.name || 'Unknown';
  const countryCode = Array.isArray(countries) ? countries[0]?.code : countries?.code || 'N/A';

  // 3. Build query for available candidates, then narrow to this employer's
  // country. Candidate destinations live in candidate_countries (many-to-many)
  // — candidate_public_view has no single country column to filter on directly.
  const { data: allAvailable } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  const availableIds = (allAvailable || []).map((c: any) => c.id);
  const candidateCountryMap: Record<string, string[]> = {};
  if (availableIds.length > 0) {
    const { data: candidateCountries } = await supabase
      .from('candidate_countries')
      .select('candidate_id, countries(name)')
      .in('candidate_id', availableIds);

    (candidateCountries || []).forEach((row: any) => {
      const country = Array.isArray(row.countries) ? row.countries[0] : row.countries;
      if (!country?.name) return;
      if (!candidateCountryMap[row.candidate_id]) candidateCountryMap[row.candidate_id] = [];
      candidateCountryMap[row.candidate_id].push(country.name);
    });
  }

  const dbCandidates = (allAvailable || []).filter((c: any) =>
    c.open_to_all_countries || (candidateCountryMap[c.id] || []).includes(countryName)
  );

  // Filter by position if provided in search params
  const currentPosition = params.position || 'all';
  let filteredCandidates = dbCandidates;

  if (currentPosition !== 'all') {
    filteredCandidates = filteredCandidates.filter(c =>
      c.positions && c.positions.includes(currentPosition)
    );
  }

  if (params.q) {
    const q = params.q.trim().toLowerCase();
    filteredCandidates = filteredCandidates.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      (c.public_code || '').toLowerCase().includes(q)
    );
  }

  // 4. Extract unique positions from candidates for the tabs
  const positionSet = new Set<string>();
  (dbCandidates || []).forEach(c => {
    if (c.positions) {
      c.positions.forEach((p: string) => positionSet.add(p));
    }
  });
  const positionsTabs = Array.from(positionSet).sort();

  const candidates = filteredCandidates.map((c: any) => {
    return {
      id: c.id,
      public_code: c.public_code,
      initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
      name: `${c.first_name} ${c.last_name}`,
      nationality: c.nationality,
      positions: c.positions || [],
      status: 'AVAILABLE',
      statusColor: '#475569',
      statusBg: '#f1f5f9'
    };
  });

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Browse candidates" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1>Browse candidates</h1>
              <p className="ph-sub">Candidates cleared for {countryName}. Select one to reserve them instantly.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Showing {countryName}
              <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none' }}>{countryCode.substring(0, 3).toUpperCase()}</span>
            </div>
          </div>

          {/* Privacy Alert Box */}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
              Contact details — phone, email and address — are visible to administrators only. You'll see everything needed to assess fit.
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
            <Link href="/dashboard/employer/candidates">
              <button style={{ background: 'none', border: 'none', borderBottom: currentPosition === 'all' ? '2px solid var(--brand)' : 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: currentPosition === 'all' ? 'var(--ink)' : 'var(--slate)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                All positions
              </button>
            </Link>
            {positionsTabs.map(p => (
              <Link key={p} href={`/dashboard/employer/candidates?position=${encodeURIComponent(p)}`}>
                <button style={{ background: 'none', border: 'none', borderBottom: currentPosition === p ? '2px solid var(--brand)' : 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: currentPosition === p ? 'var(--ink)' : 'var(--slate)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {p}
                </button>
              </Link>
            ))}
          </div>

          {/* Candidate Cards Grid */}
          <div className="resp-grid-cards">
            {candidates.map((c) => {
              const isAvailable = c.status === 'AVAILABLE';

              return (
                <div key={c.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
                  {/* Top Header - Gradient */}
                  <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none', padding: '4px 8px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        • {c.status}
                      </span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '48px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', opacity: 0.9 }}>
                      {c.initials}
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '16px', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                      {c.public_code} <span style={{ color: 'var(--line-2)' }}>·</span> {c.nationality}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', flex: 1 }}>
                      {c.positions.map((p: string) => (
                        <span key={p} style={{ fontSize: '11.5px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: '#fff', color: 'var(--slate)' }}>
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    {isAvailable ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href={`/dashboard/employer/candidates/${c.public_code}`} style={{ flex: 1 }}>
                          <button className="btn" style={{ width: '100%', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                            View
                          </button>
                        </Link>
                        <Link href={`/dashboard/employer/offers?select=${c.public_code}`} style={{ flex: 1 }}>
                          <button className="btn" style={{ width: '100%', background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                            Select
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/dashboard/employer/candidates/${c.public_code}`}>
                        <button className="btn" style={{ width: '100%', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                          View profile
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {candidates.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                No available candidates found matching the selected position.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
