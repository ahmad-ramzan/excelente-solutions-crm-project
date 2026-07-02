import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import AssignSalespersonCell from './AssignSalespersonCell';

export default async function AdminEmployersPage() {
  const supabase = await createClient();

  const [{ data: employers }, { data: salespersons }, { data: offers }] = await Promise.all([
    supabase
      .from('employers')
      .select('id, public_code, name, assigned_salesperson_id, countries(name, code)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('role', 'salesperson').eq('status', 'active').order('full_name'),
    supabase.from('job_offers').select('employer_id'),
  ]);

  const salespersonMap: Record<string, string> = {};
  (salespersons || []).forEach(s => { salespersonMap[s.id] = s.full_name; });

  const offerCountByEmployer: Record<string, number> = {};
  (offers || []).forEach(o => { offerCountByEmployer[o.employer_id] = (offerCountByEmployer[o.employer_id] || 0) + 1; });

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Employers" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Employers</h1>
              <p className="ph-sub">Every registered company, including any not yet assigned a salesperson.</p>
            </div>
          </div>

          <div className="card" style={{ marginTop: '22px' }}>
            <div className="card-b">
              <table>
                <thead>
                  <tr>
                    <th>Employer</th>
                    <th>Country</th>
                    <th>Job offers</th>
                    <th>Salesperson</th>
                  </tr>
                </thead>
                <tbody>
                  {(employers || []).map((e: any) => (
                    <tr key={e.id}>
                      <td>
                        <div className="cell-name">
                          <div className="av-sm">{e.name.substring(0, 2).toUpperCase()}</div>
                          <div>
                            <div className="nm">{e.name}</div>
                            <div className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--muted)' }}>{e.public_code}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {e.countries?.name || 'Unassigned'} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{e.countries?.code || '--'}</span>
                      </td>
                      <td className="mono">{offerCountByEmployer[e.id] || 0}</td>
                      <td style={{ textAlign: 'right' }}>
                        <AssignSalespersonCell
                          employerId={e.id}
                          currentSalespersonId={e.assigned_salesperson_id}
                          salespersons={salespersons || []}
                        />
                      </td>
                    </tr>
                  ))}
                  {(!employers || employers.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No employers found.</td>
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
