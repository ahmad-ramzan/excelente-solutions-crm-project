import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Candidates
  const { data: dbCandidates } = await supabase.from('candidates').select('id, first_name, last_name, nationality, status, countries(name), candidate_positions(position_name)').limit(5);
  // Using static agents for mockup fidelity
  const agents = ['Amir Khan', 'Amir Khan', 'Amir Khan', 'Amir Khan', 'Sami Malik'];
  const candidates = (dbCandidates || []).map((c: any, index: number) => ({
    id: c.id,
    initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
    name: `${c.first_name} ${c.last_name}`,
    nationality: c.nationality,
    country: c.countries?.name || 'Unassigned',
    trade: c.candidate_positions?.[0]?.position_name || 'N/A',
    agent: agents[index % agents.length],
    status: c.status
  }));

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Console overview</h1>
              <p className="ph-sub">Everything across all countries, roles and candidates.</p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">Export</button>
              <button className="btn btn-gold btn-sm">+ New Order</button>
            </div>
          </div>

          {/* Stats — matching prototype */}
          <div className="stats">
            <div className="stat accent">
              <div className="lab">Total candidates</div>
              <div className="v">89</div>
              <div className="ft">+12 this month</div>
            </div>
            <div className="stat">
              <div className="lab">Available</div>
              <div className="v">41</div>
            </div>
            <div className="stat">
              <div className="lab">Selected</div>
              <div className="v">17</div>
            </div>
            <div className="stat">
              <div className="lab">Visa processing</div>
              <div className="v">19</div>
            </div>
            <div className="stat">
              <div className="lab">Approved</div>
              <div className="v">12</div>
            </div>
          </div>

          {/* Second row of stats */}
          <div className="stats">
            <div className="stat">
              <div className="lab">Countries</div>
              <div className="v">4</div>
            </div>
            <div className="stat">
              <div className="lab">Positions</div>
              <div className="v">8</div>
            </div>
            <div className="stat">
              <div className="lab">Salespersons</div>
              <div className="v">3</div>
            </div>
            <div className="stat">
              <div className="lab">Agents</div>
              <div className="v">6</div>
            </div>
            <div className="stat">
              <div className="lab">Employers</div>
              <div className="v">9</div>
            </div>
            <div className="stat">
              <div className="lab">Lawyers</div>
              <div className="v">5</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Recent Candidates */}
            <div className="card">
              <div className="card-h">
                <h3>Recent candidates</h3>
                <span className="lnk">View all</span>
              </div>
              <div className="card-b">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Country</th>
                      <th>Agent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="cell-name">
                            <div className="av-sm">{c.initials}</div>
                            <div>
                              <div className="nm">{c.name}</div>
                              <div className="meta">CAC - 204{candidates.indexOf(c) + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="flag">
                            {c.country}
                            <span className="fc">{c.country.slice(0, 2).toUpperCase()}</span>
                          </span>
                        </td>
                        <td>{c.agent}</td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="split-col">
              {/* Source breakdown */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidates by country</h3>
                </div>
                <div className="card-pad">
                  <div className="bars">
                    {[
                      { label: 'Russia', code: 'RU', pct: 75, n: '18' },
                      { label: 'Greece', code: 'GR', pct: 100, n: '24' },
                      { label: 'Poland', code: 'PL', pct: 45, n: '11' },
                      { label: 'Romania', code: 'RO', pct: 30, n: '7' },
                    ].map((b) => (
                      <div key={b.label} className="barrow">
                        <div className="bl" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '12.5px' }}>{b.label}</span>
                          <span style={{ fontSize: '9px', background: 'var(--ink)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'var(--font-ibm-mono, monospace)' }}>{b.code}</span>
                        </div>
                        <div className="bt">
                          <div className="bf" style={{ width: `${b.pct}%` }} />
                        </div>
                        <div className="bn">{b.n}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Health Pipeline */}
              <div className="card">
                <div className="card-h">
                  <h3>Pipeline health</h3>
                </div>
                <div className="card-b">
                  <div style={{ padding: '18px 22px' }}>
                    <div className="pipe">
                      {[
                        { label: 'Available', icon: '↻', color: 'var(--slate)' },
                        { label: 'Selected', icon: '+', color: 'var(--green)' },
                        { label: 'VISA Processing', icon: '🏢', color: 'var(--gold)' },
                        { label: 'Approved', icon: '✓', color: 'var(--muted)' },
                      ].map((ps, idx) => {
                        const stage = 3;
                        const isDone = idx + 1 < stage;
                        const isCur = idx + 1 === stage;
                        const isLast = idx === 3;
                        return (
                          <div key={ps.label} className={`node ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                            <div className="stamp" style={{
                              color: isCur || isDone ? ps.color : 'var(--muted)',
                              borderColor: isCur || isDone ? ps.color : 'var(--line)',
                              background: isCur || isDone ? 'transparent' : 'var(--card)'
                            }}>
                              {ps.icon}
                            </div>
                            <div className="lab">{ps.label}</div>
                            {!isLast && <div className="bar" />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--slate)', lineHeight: 1.5 }}>
                      52 of 89 candidates have advanced past selection. 12 fully approved this quarter.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
