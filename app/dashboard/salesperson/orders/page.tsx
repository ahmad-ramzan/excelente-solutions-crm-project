import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { orders } from '../../../lib/mock-data';

export default function JobOffersPage() {
  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Job Offers" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Job Offers</h1>
              <p className="ph-sub">{orders.length} recruitment requirements — click an offer to manage its position slots.</p>
            </div>
            <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
              + New Job Offer
            </button>
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
                  {orders.map((o, i) => {
                    const countryCodes: Record<string, string> = {
                      'Russia': 'RU',
                      'Greece': 'GR',
                      'Poland': 'PL',
                      'Romania': 'RO',
                    };
                    const cCode = countryCodes[o.country] || 'XX';
                    
                    const progress = Math.round((o.filled / o.headcount) * 100);
                    const isComplete = o.filled >= o.headcount;

                    // Mock data logic for dates to match screenshot visually
                    const startDate = i === 0 ? "01 Aug 2026" : i === 1 ? "15 Aug 2026" : "01 Sep 2026";
                    const endDate = i === 0 ? "01 Feb 2027" : i === 1 ? "15 Mar 2027" : "01 Apr 2027";

                    return (
                      <tr key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          JO-<br/>{118 + i}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                           <div style={{ maxWidth: '100px', lineHeight: '1.4' }}>
                             {o.employer.split(' ')[0]}<br />
                             {o.employer.split(' ').slice(1).join(' ')}
                           </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{o.country}</span> 
                          <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{cCode}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {o.role}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                             <div style={{ width: '40px', height: '6px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden' }}>
                               <div style={{ width: `${progress}%`, height: '100%', background: isComplete ? 'var(--green)' : 'var(--brand)', borderRadius: '999px' }}></div>
                             </div>
                             <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>{o.filled}/{o.headcount}</span>
                           </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '12.5px', lineHeight: '1.5' }}>
                          {startDate.split(' ')[0]} {startDate.split(' ')[1]}<br/>
                          {startDate.split(' ')[2]}<br/>
                          <span style={{ color: 'var(--muted)' }}>→</span> {endDate.split(' ')[0]}<br/>
                          {endDate.split(' ')[1]}<br/>
                          {endDate.split(' ')[2]}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none' }}>
                             • SIGNED
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none' }}>
                             • {isComplete ? 'COMPLETED' : 'OPEN'}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
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
    </>
  );
}
