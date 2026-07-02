import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function JobOffersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch Employers for this Salesperson
  const { data: dbEmployers } = await supabase
    .from('employers')
    .select('id')
    .eq('assigned_salesperson_id', user.id);

  const employerIds = (dbEmployers || []).map(e => e.id);

  // Fetch Job Offers for these employers
  let offersList: any[] = [];
  if (employerIds.length > 0) {
    const { data: dbOrders } = await supabase
      .from('job_offers')
      .select('id, staff_needed, status, created_at, start_date, end_date, contract_signed, countries(name, code), employers(name), positions(name)')
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

  // Format date
  const formatDateParts = (dateStr: string) => {
    if (!dateStr) return { day: '', month: '', year: '' };
    const d = new Date(dateStr);
    const parts = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).split(' ');
    return { day: parts[0], month: parts[1], year: parts[2] };
  };

  const orders = offersList.map(o => {
    const oSlots = slotsData.filter(s => s.job_offer_id === o.id);
    const filled = oSlots.filter(s => ['reserved', 'filled'].includes(s.status)).length;
    return {
      ...o,
      employerName: o.employers?.name || 'Unknown',
      countryName: o.countries?.name || 'Unassigned',
      countryCode: o.countries?.code || 'XX',
      role: o.positions?.name || 'Various',
      filled
    };
  });

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Job Offers" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Job Offers</h1>
              <p className="ph-sub">{orders.length} recruitment requirements across your employers.</p>
            </div>
            <Link href="/dashboard/salesperson/orders/new">
              <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
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
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>POSITION</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>SLOTS FILLED</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>DATES</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CONTRACT</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const progress = o.staff_needed > 0 ? Math.round((o.filled / o.staff_needed) * 100) : 0;
                    const isComplete = o.filled >= o.staff_needed && o.staff_needed > 0;

                    const sd = formatDateParts(o.start_date);
                    const ed = formatDateParts(o.end_date);
                    
                    let statusColor = '#475569';
                    let statusBg = '#f1f5f9';
                    if (o.status === 'open') { statusColor = '#3b82f6'; statusBg = '#eff6ff'; }
                    else if (o.status === 'completed') { statusColor = '#008a3d'; statusBg = '#dcf4e6'; }

                    return (
                      <tr key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          JO-<br/>{o.id.substring(0, 6).toUpperCase()}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                           <div style={{ maxWidth: '100px', lineHeight: '1.4' }}>
                             {o.employerName.split(' ')[0]}<br />
                             {o.employerName.split(' ').slice(1).join(' ')}
                           </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{o.countryName}</span> 
                          <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{o.countryCode.substring(0,3).toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {o.role}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ width: '40px', height: '6px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden' }}>
                               <div style={{ width: `${Math.min(100, progress)}%`, height: '100%', background: isComplete ? 'var(--green)' : 'var(--brand)', borderRadius: '999px' }}></div>
                             </div>
                             <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{o.filled}/{o.staff_needed}</span>
                           </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '12.5px', lineHeight: '1.5' }}>
                          {sd.day} {sd.month}<br/>
                          {sd.year}<br/>
                          <span style={{ color: 'var(--muted)' }}>→</span> {ed.day}<br/>
                          {ed.month}<br/>
                          {ed.year}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: o.contract_signed ? '#dcf4e6' : '#fef1d8', color: o.contract_signed ? '#008a3d' : '#b46d00', border: 'none' }}>
                             • {o.contract_signed ? 'SIGNED' : 'PENDING'}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: statusBg, color: statusColor, border: 'none' }}>
                             • {o.status.toUpperCase()}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <Link href={`/dashboard/salesperson/orders/${o.id}`}>
                            <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                              →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                        No job offers found.
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
