import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function SalespersonDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch Employers for this Salesperson
  const { data: dbEmployers } = await supabase
    .from('employers')
    .select('id, name, country_id, countries(name, code)')
    .eq('assigned_salesperson_id', user.id)
    .order('created_at', { ascending: false });

  const employersList: any[] = dbEmployers || [];
  const employerIds = employersList.map(e => e.id);

  // Fetch Job Offers for these employers
  let offersList: any[] = [];
  if (employerIds.length > 0) {
    const { data: dbOrders } = await supabase
      .from('job_offers')
      .select('id, staff_needed, status, created_at, countries(name, code), employers(name), positions(name)')
      .in('employer_id', employerIds)
      .order('created_at', { ascending: false });
    
    offersList = dbOrders || [];
  }

  // Get filled counts for offers (using job_offer_slots)
  let slotsData: any[] = [];
  if (offersList.length > 0) {
    const offerIds = offersList.map(o => o.id);
    const { data: sData } = await supabase
      .from('job_offer_slots')
      .select('job_offer_id, status')
      .in('job_offer_id', offerIds);
    slotsData = sData || [];
  }

  // Aggregate stats
  const activeOffers = offersList.filter(o => ['draft', 'open'].includes(o.status));
  const staffNeeded = offersList.reduce((acc, curr) => acc + (curr.staff_needed || 0), 0);
  const staffSelected = slotsData.filter(s => ['reserved', 'filled'].includes(s.status)).length;
  const progressPercent = staffNeeded > 0 ? Math.round((staffSelected / staffNeeded) * 100) : 0;

  // Prepare order array for display
  const orders = offersList.map(o => {
    const oSlots = slotsData.filter(s => s.job_offer_id === o.id);
    const filled = oSlots.filter(s => ['reserved', 'filled'].includes(s.status)).length;
    return {
      id: o.id,
      employer: o.employers?.name || 'Unknown',
      country: o.countries?.name || 'Unassigned',
      role: o.positions?.name || 'Various',
      headcount: o.staff_needed || 0,
      filled,
      status: o.status
    };
  });

  // Prepare employers array for display
  const employers = employersList.map(e => {
    const eOffers = offersList.filter(o => o.employers?.name === e.name); // Using name to match for simplicity here, though id is better, but employers() doesn't return id in the nested select unless requested
    const eStaffNeeded = eOffers.reduce((acc, curr) => acc + (curr.staff_needed || 0), 0);
    const eOfferIds = eOffers.map(o => o.id);
    const eSlots = slotsData.filter(s => eOfferIds.includes(s.job_offer_id));
    const eFilled = eSlots.filter(s => ['reserved', 'filled'].includes(s.status)).length;

    return {
      id: e.id,
      initials: e.name.substring(0, 2).toUpperCase(),
      name: e.name,
      country: e.countries?.name || 'Unassigned',
      countryCode: e.countries?.code || 'XX',
      orders: eOffers.length,
      placements: eFilled,
      totalNeeded: eStaffNeeded
    };
  });

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1>Sales overview</h1>
              <p className="ph-sub">Your employers, their orders and how recruitment is tracking.</p>
            </div>
          </div>

          <div className="resp-grid-auto">
            {/* My employers */}
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)' }}>My employers</div>
              <div className="v" style={{ color: '#fff' }}>{employers.length}</div>
            </div>
            {/* Active Job Offers */}
            <div className="stat">
              <div className="lab">Active Job Offers</div>
              <div className="v">{activeOffers.length}</div>
            </div>
            {/* Total Job Offers */}
            <div className="stat">
              <div className="lab">Total Job Offers</div>
              <div className="v">{offersList.length}</div>
            </div>
            {/* Staff needed */}
            <div className="stat">
              <div className="lab">Staff needed</div>
              <div className="v">{staffNeeded}</div>
            </div>
            {/* Staff selected */}
            <div className="stat">
              <div className="lab">Staff selected</div>
              <div className="v">{staffSelected}</div>
              <div className="ft" style={{ color: 'var(--green)' }}>{progressPercent}% filled</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Job Offers progress */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Job Offers progress</h3>
                <Link href="/dashboard/salesperson/orders">
                  <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>All offers</span>
                </Link>
              </div>
              <div className="card-b" style={{ padding: '8px 22px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {orders.slice(0, 5).map((o) => {
                      const progress = o.headcount > 0 ? Math.round((o.filled / o.headcount) * 100) : 0;
                      const isComplete = o.filled >= o.headcount && o.headcount > 0;
                      const empShort = o.employer.split(' ')[0];
                      return (
                        <tr key={o.id}>
                          <td style={{ padding: '12px 0', color: 'var(--slate)', width: '140px', fontSize: '13px' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                              {empShort} · {o.role}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                             <div style={{ height: '8px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden', width: '100%' }}>
                               <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: isComplete ? 'var(--green)' : 'var(--brand)', borderRadius: '999px' }}></div>
                             </div>
                          </td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: 'var(--ink)', width: '50px', fontSize: '13px' }}>
                            {o.filled}/{o.headcount}
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                          No job offers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My employers */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>My employers</h3>
                <Link href="/dashboard/salesperson/employers">
                  <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>Manage</span>
                </Link>
              </div>
              <div className="card-b" style={{ padding: '0 22px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {employers.slice(0, 5).map((e, i) => {
                      return (
                        <tr key={e.id} style={{ borderBottom: i === Math.min(employers.length, 5) - 1 ? 'none' : '1px solid var(--line)' }}>
                          <td style={{ padding: '16px 0' }}>
                            <div className="cell-name">
                              <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '14px' }}>
                                {e.initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>{e.name}</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {e.country} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', margin: 0 }}>{e.countryCode.substring(0,3).toUpperCase()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>
                            <div style={{ color: 'var(--slate)', fontSize: '13.5px', marginBottom: '2px' }}>
                              <span style={{ color: 'var(--ink)' }}>{e.placements}/{e.totalNeeded}</span>
                            </div>
                            <div style={{ color: 'var(--slate)', fontSize: '13px' }}>staffed</div>
                          </td>
                        </tr>
                      );
                    })}
                    {employers.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                          No employers assigned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
