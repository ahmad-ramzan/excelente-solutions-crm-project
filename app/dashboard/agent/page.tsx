import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import { createClient, getAuthUser } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getDashboardStats } from '@/app/lib/queries';
import Link from 'next/link';

export default async function AgentDashboard() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const user = await getAuthUser();
  if (!user) return null;

  const [stats, { data: dbCandidates }] = await Promise.all([
    getDashboardStats(supabase, 'agent', user.id),
    supabase
      .from('candidate_public_view')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const candidateIds = (dbCandidates || []).map(c => c.id);
  const countryMap: Record<string, { names: string[]; codes: string[] }> = {};
  const employerMap: Record<string, string> = {};

  if (candidateIds.length > 0) {
    // Independent of each other — fetch concurrently.
    const [{ data: candidateCountries }, { data: selections }] = await Promise.all([
      adminClient
        .from('candidate_countries')
        .select('candidate_id, countries(name, code)')
        .in('candidate_id', candidateIds),
      adminClient
        .from('job_offer_selections')
        .select('candidate_id, employers(name)')
        .in('candidate_id', candidateIds),
    ]);

    (candidateCountries || []).forEach((row: any) => {
      const country = Array.isArray(row.countries) ? row.countries[0] : row.countries;
      if (!country) return;
      if (!countryMap[row.candidate_id]) countryMap[row.candidate_id] = { names: [], codes: [] };
      if (country.name) countryMap[row.candidate_id].names.push(country.name);
      if (country.code) countryMap[row.candidate_id].codes.push(country.code);
    });

    selections?.forEach((s: any) => {
      const employer = Array.isArray(s.employers) ? s.employers[0] : s.employers;
      employerMap[s.candidate_id] = employer?.name || 'Unknown';
    });
  }

  const candidates = (dbCandidates || []).map((c: any) => {
    let bg = 'var(--line-2)';
    let color = 'var(--slate)';
    if (c.status === 'available') { bg = '#dcfce7'; color = '#166534'; }
    else if (c.status === 'selected') { bg = '#fef08a'; color = '#854d0e'; }
    else if (c.status === 'visa_processing') { bg = '#e0e7ff'; color = '#3730a3'; }
    else if (c.status === 'approved') { bg = '#dbeafe'; color = '#1e40af'; }

    const assignedCountries = countryMap[c.id]?.names || [];
    const assignedCountryCodes = countryMap[c.id]?.codes || [];

    return {
      id: c.id,
      public_code: c.public_code,
      initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
      name: `${c.first_name} ${c.last_name}`,
      nationality: c.nationality,
      country: c.open_to_all_countries ? 'Any Country' : (assignedCountries.join(', ') || 'Unassigned'),
      countryCode: c.open_to_all_countries ? 'ANY' : (assignedCountryCodes.length === 1 ? assignedCountryCodes[0] : (assignedCountries.length ? `${assignedCountries.length} selected` : 'N/A')),
      positions: c.positions || [],
      employer: employerMap[c.id] || 'Not Assigned',
      status: c.status.replace(/_/g, ' ').toUpperCase(),
      statusBg: bg,
      statusColor: color,
    };
  });

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Dashboard" role="agent" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Agent overview</h1>
              <p className="ph-sub">Your candidates and where each one stands.</p>
            </div>
          </div>

          {/* Action Required Alert Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: '#f5f3ff',
            border: '1px solid #e1d4fc',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'var(--brand)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0
              }}>
                !
              </div>
              <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--ink)' }}>Stay updated with your candidates.</strong> Check required documents for candidates in visa processing to ensure quick approval.
              </div>
            </div>
            <Link href="/dashboard/agent/candidates">
              <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, flexShrink: 0, cursor: 'pointer' }}>
                Review
              </button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            <Link href="/dashboard/agent/profile" style={{ display: 'block' }}>
              <div className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontWeight: 600, padding: '12px', color: 'var(--ink)' }}>
                PROFILE
              </div>
            </Link>
            <Link href="/dashboard/agent/vacancies" style={{ display: 'block' }}>
              <div className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontWeight: 600, padding: '12px', color: 'var(--ink)' }}>
                VIEW VACANCIES
              </div>
            </Link>
            <Link href="/dashboard/agent/selected" style={{ display: 'block' }}>
              <div className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', fontWeight: 600, padding: '12px', color: 'var(--ink)' }}>
                VIEW SELECTED CANDIDATES
              </div>
            </Link>
            <Link href="/dashboard/agent/candidates/new" style={{ display: 'block' }}>
              <div className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', fontWeight: 600, padding: '12px' }}>
                UPLOAD RESUME
              </div>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="resp-grid-auto">
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)' }}>My candidates</div>
              <div className="v" style={{ color: '#fff' }}>{stats.total_candidates}</div>
            </div>
            <div className="stat">
              <div className="lab">Available</div>
              <div className="v">{stats.candidates?.available || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Selected</div>
              <div className="v">{stats.candidates?.selected || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Visa processing</div>
              <div className="v">{stats.candidates?.visa_processing || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Approved</div>
              <div className="v">{stats.candidates?.approved || 0}</div>
            </div>
          </div>

          {/* My Candidates Table */}
          <div className="card">
            <div className="card-h">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>My candidates</h3>
              <Link href="/dashboard/agent/candidates">
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>View all</span>
              </Link>
            </div>
            <div className="card-b" style={{ padding: '0 22px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>CANDIDATE</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>COUNTRY</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>POSITIONS</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>EMPLOYER</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>STATUS</th>
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
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{c.country}</span>
                        <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{c.countryCode}</span>
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
                      <td style={{ padding: '16px 0', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                          • {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)' }}>No candidates registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
