import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';

export default async function SalespersonDashboard() {
  const supabase = await createClient();

  // Fetch Employers for this Salesperson
  const { data: dbEmployers } = await supabase.from('employers').select('id, name, contact_details, countries(name)').limit(5);
  const employers = (dbEmployers || []).map((e: any) => ({
    id: e.id,
    initials: e.name.substring(0, 2).toUpperCase(),
    name: e.name,
    country: e.countries?.name || 'Unassigned',
    contact: e.contact_details || 'N/A',
    orders: 0,
    placements: 0
  }));

  // Fetch Job Offers
  const { data: dbOrders } = await supabase.from('job_offers').select('id, position_name, headcount, status, countries(name, code), employers(name)').limit(5);
  const orders = (dbOrders || []).map((o: any) => ({
    id: o.id,
    employer: o.employers?.name || 'Unknown',
    country: o.countries?.name || 'Unassigned',
    role: o.position_name,
    headcount: o.headcount,
    filled: 0,
    status: o.status
  }));

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {/* My employers */}
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)' }}>My employers</div>
              <div className="v" style={{ color: '#fff' }}>3</div>
            </div>
            {/* Active Job Offers */}
            <div className="stat">
              <div className="lab">Active Job Offers</div>
              <div className="v">3</div>
            </div>
            {/* Open positions */}
            <div className="stat">
              <div className="lab">Open positions</div>
              <div className="v">3</div>
            </div>
            {/* Staff needed */}
            <div className="stat">
              <div className="lab">Staff needed</div>
              <div className="v">112</div>
            </div>
            {/* Staff selected */}
            <div className="stat">
              <div className="lab">Staff selected</div>
              <div className="v">55</div>
              <div className="ft" style={{ color: 'var(--green)' }}>49% filled</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Job Offers progress */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Job Offers progress</h3>
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>All orders</span>
              </div>
              <div className="card-b" style={{ padding: '8px 22px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {orders.slice(0, 4).map((o) => {
                      const progress = Math.round((o.filled / o.headcount) * 100);
                      const isComplete = o.filled >= o.headcount;
                      const empShort = o.employer.split(' ')[0];
                      return (
                        <tr key={o.id}>
                          <td style={{ padding: '12px 0', color: 'var(--slate)', width: '140px' }}>
                            {empShort} · {o.role}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                             <div style={{ height: '8px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden', width: '100%' }}>
                               <div style={{ width: `${progress}%`, height: '100%', background: isComplete ? 'var(--green)' : 'var(--brand)', borderRadius: '999px' }}></div>
                             </div>
                          </td>
                          <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: 'var(--ink)', width: '50px' }}>
                            {o.filled}/{o.headcount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* My employers */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>My employers</h3>
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>Manage</span>
              </div>
              <div className="card-b" style={{ padding: '0 22px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {employers.map((e, i) => {
                      const countryCodes: Record<string, string> = {
                        'Russia': 'RU', 'Greece': 'GR', 'Poland': 'PL', 'Romania': 'RO'
                      };
                      const cCode = countryCodes[e.country] || 'XX';
                      const totalNeeded = e.orders * 25 + (i * 5); // Mock total for 'staffed' fraction
                      return (
                        <tr key={e.id} style={{ borderBottom: i === employers.length - 1 ? 'none' : '1px solid var(--line)' }}>
                          <td style={{ padding: '16px 0' }}>
                            <div className="cell-name">
                              <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '14px' }}>
                                {e.initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>{e.name}</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {e.country} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', margin: 0 }}>{cCode}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>
                            <div style={{ color: 'var(--slate)', fontSize: '13.5px', marginBottom: '2px' }}>
                              <span style={{ color: 'var(--ink)' }}>{e.placements}/{totalNeeded}</span>
                            </div>
                            <div style={{ color: 'var(--slate)', fontSize: '13px' }}>staffed</div>
                          </td>
                        </tr>
                      );
                    })}
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
