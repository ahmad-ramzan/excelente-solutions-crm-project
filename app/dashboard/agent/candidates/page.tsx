import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AgentCandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string, country?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch unique countries for filter dropdown
  const { data: dbCountries } = await supabase.from('countries').select('id, name');
  const countriesList = dbCountries || [];

  let query = supabase
    .from('candidate_public_view')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.country && params.country !== 'all') {
    query = query.eq('country_name', params.country);
  }

  const { data: dbCandidates } = await query;
  const currentStatus = params.status || 'all';

  const selectedIds = (dbCandidates || []).filter(c => c.status !== 'available').map(c => c.id);
  const employerMap: Record<string, string> = {};
  if (selectedIds.length > 0) {
    const { data: selections } = await supabase
      .from('job_offer_selections')
      .select('candidate_id, employers(name)')
      .in('candidate_id', selectedIds);
    selections?.forEach(s => {
      employerMap[s.candidate_id] = (s.employers as any)?.name || 'Unknown';
    });
  }

  const candidates = (dbCandidates || []).map((c: any) => {
    let bg = 'var(--line-2)';
    let color = 'var(--slate)';
    if (c.status === 'available') { bg = '#dcfce7'; color = '#166534'; }
    else if (c.status === 'selected') { bg = '#fef08a'; color = '#854d0e'; }
    else if (c.status === 'visa_processing') { bg = '#e0e7ff'; color = '#3730a3'; }
    else if (c.status === 'approved') { bg = '#dbeafe'; color = '#1e40af'; }
    else if (c.status === 'rejected') { bg = '#fee2e2'; color = '#b91c1c'; }

    return {
      id: c.id,
      public_code: c.public_code,
      initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
      name: `${c.first_name} ${c.last_name}`,
      country: c.country_name || 'Unassigned',
      countryCode: c.country_code || 'N/A',
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
        <AppTopbar section="My candidates" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Candidates</h1>
              <p className="ph-sub">{candidates.length} candidates registered.</p>
            </div>
            <Link href="/dashboard/agent/candidates/new">
              <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                + Add candidate
              </button>
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              {[
                { label: 'All', val: 'all' },
                { label: 'Available', val: 'available' },
                { label: 'Selected', val: 'selected' },
                { label: 'Visa processing', val: 'visa_processing' },
                { label: 'Approved', val: 'approved' }
              ].map(tab => (
                <Link key={tab.val} href={`/dashboard/agent/candidates?status=${tab.val}${params.country ? `&country=${params.country}` : ''}`}>
                  <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    borderBottom: currentStatus === tab.val ? '2px solid var(--brand)' : 'none', 
                    padding: '0 0 8px 0', 
                    fontSize: '14.5px', 
                    fontWeight: 600, 
                    color: currentStatus === tab.val ? 'var(--ink)' : 'var(--slate)', 
                    cursor: 'pointer' 
                  }}>
                    {tab.label}
                  </button>
                </Link>
              ))}
            </div>
            <div>
              <form action="/dashboard/agent/candidates" method="GET">
                {params.status && <input type="hidden" name="status" value={params.status} />}
                <select 
                  name="country" 
                  defaultValue={params.country || 'all'} 
                  onChange={(e) => e.target.form?.submit()}
                  style={{ padding: '8px 32px 8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="all">All countries</option>
                  {countriesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </form>
            </div>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>POSITIONS</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                      <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
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
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{c.country}</span> 
                        <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{c.countryCode}</span>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {c.positions.map((p: string) => (
                            <span key={p} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                           • {c.status}
                         </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <Link href={`/dashboard/agent/candidates/${c.public_code}`}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                            →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No candidates found.</td>
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
