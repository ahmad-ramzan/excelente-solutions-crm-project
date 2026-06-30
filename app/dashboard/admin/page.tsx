import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { candidates, orders, employers } from '../../lib/mock-data';

export default function AdminDashboard() {
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
              <div className="lab">Open orders</div>
              <div className="v">8</div>
            </div>
            <div className="stat">
              <div className="lab">Employers</div>
              <div className="v">3</div>
            </div>
            <div className="stat">
              <div className="lab">Agents</div>
              <div className="v">6</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Recent Candidates */}
            <div className="card">
              <div className="card-h">
                <h3>Recent Candidates</h3>
                <span className="lnk">View all →</span>
              </div>
              <div className="card-b">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Trade</th>
                      <th>Country</th>
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
                              <div className="meta">{c.nationality}</div>
                            </div>
                          </div>
                        </td>
                        <td>{c.trade}</td>
                        <td>
                          <span className="flag">
                            <span className="fc">{c.country.slice(0, 2).toUpperCase()}</span>
                            {c.country}
                          </span>
                        </td>
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
              {/* Active Orders */}
              <div className="card">
                <div className="card-h">
                  <h3>Active Orders</h3>
                  <span className="lnk">View all →</span>
                </div>
                <div className="card-b">
                  <table>
                    <thead>
                      <tr>
                        <th>Employer</th>
                        <th>Role</th>
                        <th>Filled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <div className="nm" style={{ fontWeight: 600 }}>{o.employer}</div>
                            <div className="meta" style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              {o.country}
                            </div>
                          </td>
                          <td>{o.role}</td>
                          <td>
                            <span
                              className="mono"
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: o.filled === o.headcount ? 'var(--green)' : 'var(--amber)',
                              }}
                            >
                              {o.filled}/{o.headcount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{b.label}</span>
                          <span style={{ fontSize: '10px', background: 'var(--ink)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'var(--font-ibm-mono, monospace)' }}>{b.code}</span>
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
                  <h3>Medical Clearances</h3>
                  <span className="lnk">View cases →</span>
                </div>
                <div className="card-b">
                  <div style={{ padding: '18px 22px' }}>
                    <div className="pipe">
                      {[
                        { label: 'Scheduled', icon: '📅' },
                        { label: 'Examined', icon: '🩺' },
                        { label: 'Lab Results', icon: '🧪' },
                        { label: 'Cleared', icon: '✅' },
                      ].map((ps, idx) => {
                        const stage = 3;
                        const isDone = idx + 1 < stage;
                        const isCur = idx + 1 === stage;
                        const isLast = idx === 3;
                        return (
                          <div key={ps.label} className={`node ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                            <div className="stamp">{ps.icon}</div>
                            <div className="lab">{ps.label}</div>
                            {!isLast && <div className="bar" />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      <b>24</b> candidates currently in medical processing
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
