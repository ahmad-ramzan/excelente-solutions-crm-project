import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';

export default async function AgentVacanciesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: vacancies } = await supabase
    .from('job_offer_progress')
    .select('*')
    .in('status', ['open'])
    .order('created_at', { ascending: false });

  const offers = vacancies || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Vacancies" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Vacancies</h1>
              <p className="ph-sub">Current open positions needing candidates.</p>
            </div>
          </div>

          <div className="card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>JOB / POSITION</th>
                  <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>EMPLOYER</th>
                  <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>NEEDED</th>
                  <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>SELECTED</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(o => (
                  <tr key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                    <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '14px' }}>{o.position_name}</div>
                      <div style={{ color: 'var(--slate)', fontSize: '12px', marginTop: '4px' }}>
                        <span className="chip" style={{ background: 'var(--ink)', color: '#fff', fontSize: '10px', padding: '2px 6px', marginRight: '6px' }}>{o.country_code}</span>
                        {o.country_name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontWeight: 500, color: 'var(--ink)', fontSize: '13px' }}>{o.employer_name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{o.public_code}</div>
                    </td>
                    <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', textAlign: 'center', color: 'var(--slate)', fontWeight: 500 }}>
                      {o.staff_needed}
                    </td>
                    <td style={{ padding: '16px 22px', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', textAlign: 'center', color: 'var(--brand)', fontWeight: 600 }}>
                      {o.selected_count} / {o.staff_needed}
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                      No open vacancies at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
