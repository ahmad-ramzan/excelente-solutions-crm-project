import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function JobOffersPage() {
  const supabase = await createClient();

  const { data: offers } = await supabase
    .from('job_offers')
    .select(`
      id,
      public_code,
      title,
      staff_needed,
      start_date,
      end_date,
      status,
      employers (name),
      countries (name, code),
      positions (name)
    `)
    .order('created_at', { ascending: false });

  // Get filled counts
  const offerIds = (offers || []).map((o: any) => o.id);
  const filledMap: Record<string, number> = {};
  if (offerIds.length > 0) {
    const { data: selections } = await supabase
      .from('job_offer_selections')
      .select('job_offer_id')
      .in('job_offer_id', offerIds);
    
    selections?.forEach(s => {
      filledMap[s.job_offer_id] = (filledMap[s.job_offer_id] || 0) + 1;
    });
  }

  const formatMonthYear = (d?: string) => {
    if (!d) return '--';
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '\n');
  };

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Job Offers" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Job Offers</h1>
              <p className="ph-sub">{offers?.length || 0} recruitment requirements — click an offer to manage its position slots.</p>
            </div>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent', marginTop: '32px' }}>
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
                  {offers?.map((o) => {
                    const countryName = (o.countries as any)?.name || 'Unknown';
                    const countryCode = (o.countries as any)?.code || '--';
                    const employerName = (o.employers as any)?.name || 'Unknown';
                    const positionName = (o.positions as any)?.name || o.title || 'Unknown';
                    
                    const filled = filledMap[o.id] || 0;
                    const headcount = o.staff_needed;
                    const progress = headcount > 0 ? Math.round((filled / headcount) * 100) : 0;
                    const isCompleted = filled >= headcount && headcount > 0;
                    
                    return (
                      <tr key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)' }}>
                          <div dangerouslySetInnerHTML={{ __html: o.public_code.replace('-', '-<br/>') }} />
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--brand)', maxWidth: '140px' }}>
                          {employerName.split(' ').map((word: string, wIdx: number) => <div key={wIdx}>{word}</div>)}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{countryName}</span> <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{countryCode}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {positionName}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '60px', height: '6px', background: 'var(--line-2)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: isCompleted ? 'var(--green)' : 'var(--brand)', borderRadius: '4px' }}></div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '12px' }}>{filled}/{headcount}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '12px', lineHeight: '1.4' }}>
                          <span style={{ whiteSpace: 'pre-line' }}>{formatMonthYear(o.start_date)}</span>
                          {o.end_date && (
                            <>
                              <br/>→ <span style={{ whiteSpace: 'pre-line' }}>{formatMonthYear(o.end_date)}</span>
                            </>
                          )}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span className="tag t-approve">• SIGNED</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className={`tag ${o.status === 'completed' || isCompleted ? 't-approve' : o.status === 'closed' ? 't-closed' : 't-open'}`}>• {(o.status === 'completed' || isCompleted) ? 'COMPLETED' : o.status.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <Link href={`/dashboard/admin/offers/${o.public_code}`}>
                            <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                              →
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {offers?.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No job offers found.</td>
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
