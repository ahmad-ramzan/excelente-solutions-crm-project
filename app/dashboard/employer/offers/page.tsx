import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function EmployerJobOffersPage() {
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
    .select('id, name')
    .eq('id', employerUser.employer_id)
    .single();

  if (!employer) return null;

  // 3. Fetch Job Offers for this employer
  const { data: offersData } = await supabase
    .from('job_offers')
    .select('*, countries(name, code), positions(name)')
    .eq('employer_id', employer.id)
    .order('created_at', { ascending: false });

  const offers = offersData || [];

  // Get filled counts for all offers
  const offerIds = offers.map(o => o.id);
  const filledCounts: Record<string, number> = {};
  if (offerIds.length > 0) {
    const { data: selections } = await supabase
      .from('job_offer_selections')
      .select('job_offer_id, status')
      .in('job_offer_id', offerIds)
      .in('status', ['selected', 'visa_processing', 'approved']);
      
    selections?.forEach(s => {
      if (!filledCounts[s.job_offer_id]) filledCounts[s.job_offer_id] = 0;
      filledCounts[s.job_offer_id]++;
    });
  }

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="My Job Offers" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Job Offers</h1>
              <p className="ph-sub">{offers.length} recruitment requirements — click an offer to manage its position slots.</p>
            </div>
            <Link href="/dashboard/employer/offers/new">
              <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                + New Job Offer
              </button>
            </Link>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent', marginTop: '24px' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>ORDER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>POSITION</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>SLOTS FILLED</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => {
                    const cCode = o.countries?.code || 'XX';
                    const countryName = o.countries?.name || 'Unknown';
                    const positionName = o.positions?.name || 'Various';
                    const filled = filledCounts[o.id] || 0;
                    
                    const progress = o.staff_needed > 0 ? Math.round((filled / o.staff_needed) * 100) : 0;
                    const isComplete = filled >= o.staff_needed && o.staff_needed > 0;
                    
                    let statusColor = '#008a3d';
                    let statusBg = '#dcf4e6';
                    if (o.status === 'open') { statusColor = '#3b82f6'; statusBg = '#eff6ff'; }
                    else if (o.status === 'draft') { statusColor = '#475569'; statusBg = '#f1f5f9'; }

                    return (
                      <tr key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          JO-{o.id.substring(0,6).toUpperCase()}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{countryName}</span> 
                          <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{cCode.substring(0,3).toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {positionName}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ width: '40px', height: '6px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden' }}>
                               <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: isComplete ? 'var(--green)' : 'var(--brand)', borderRadius: '999px' }}></div>
                             </div>
                             <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{filled}/{o.staff_needed}</span>
                           </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: statusBg, color: statusColor, border: 'none' }}>
                             • {o.status.toUpperCase()}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <Link href={`/dashboard/employer/offers/${o.id}`}>
                              <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                                →
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {offers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                        No job offers found. Create your first job offer!
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
