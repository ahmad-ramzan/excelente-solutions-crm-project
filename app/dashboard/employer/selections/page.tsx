import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function EmployerSelectionsPage() {
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

  // 2. Fetch selections with candidate and offer details
  const { data: selectionsData } = await supabase
    .from('job_offer_selections')
    .select(`
      id,
      status,
      candidates (
        id, public_code, first_name, last_name,
        candidate_positions ( positions ( name ) )
      ),
      job_offers (
        countries ( name, code )
      ),
      employers ( name )
    `)
    .eq('employer_id', employerUser.employer_id)
    .order('selected_at', { ascending: false });

  const selections = selectionsData || [];

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="My selections" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Candidates</h1>
              <p className="ph-sub">{selections.length} candidates selected for your job offers.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--brand)', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>All</button>
            </div>
            <div>
              <select style={{ padding: '8px 32px 8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                <option>All countries</option>
              </select>
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
                  {selections.map((s) => {
                    const candidate = s.candidates;
                    if (!candidate) return null;
                    
                    const fullName = `${candidate.first_name} ${candidate.last_name}`;
                    const initials = `${candidate.first_name?.[0] || ''}${candidate.last_name?.[0] || ''}`.toUpperCase();
                    
                    // @ts-ignore
                    const countryName = s.job_offers?.countries?.name || 'Unknown';
                    // @ts-ignore
                    const countryCode = s.job_offers?.countries?.code || 'XX';
                    // @ts-ignore
                    const employerName = s.employers?.name || 'Unknown';
                    
                    // @ts-ignore
                    const positions = candidate.candidate_positions?.map(cp => cp.positions?.name).filter(Boolean) || [];

                    let statusColor = '#3b82f6';
                    let statusBg = '#eff6ff';
                    if (s.status === 'approved') {
                      statusColor = '#008a3d';
                      statusBg = '#dcf4e6';
                    } else if (s.status === 'visa_processing') {
                      statusColor = '#b46d00';
                      statusBg = '#fef1d8';
                    }

                    return (
                      <tr key={s.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                          <div className="cell-name">
                            <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{fullName}</div>
                              <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                                {candidate.public_code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{countryName}</span> 
                          <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{countryCode.substring(0,3).toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {positions.map(p => (
                              <span key={p as string} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>
                                {p as string}
                              </span>
                            ))}
                            {positions.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '12px' }}>None</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13.5px' }}>
                          {employerName}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: statusBg, color: statusColor, border: 'none' }}>
                             • {s.status.toUpperCase().replace('_', ' ')}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <Link href={`/dashboard/employer/candidates/${candidate.public_code}`}>
                            <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                              →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {selections.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                        No candidates have been selected yet.
                      </td>
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
