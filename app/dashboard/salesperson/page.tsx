import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { employers, orders } from '../../lib/mock-data';

export default function SalespersonDashboard() {
  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Salesperson Dashboard</h1>
              <p className="ph-sub">Your employers, open orders and commission pipeline.</p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">New Employer</button>
              <button className="btn btn-gold btn-sm">+ New Order</button>
            </div>
          </div>

          <div className="stats">
            <div className="stat accent">
              <div className="lab">My Employers</div>
              <div className="v">4</div>
              <div className="ft">↑ 1 new this month</div>
            </div>
            <div className="stat">
              <div className="lab">Open Orders</div>
              <div className="v">2</div>
              <div className="ft" style={{ color: 'var(--amber)' }}>38 slots open</div>
            </div>
            <div className="stat">
              <div className="lab">Placements</div>
              <div className="v">50</div>
              <div className="ft">↑ 8 this quarter</div>
            </div>
            <div className="stat">
              <div className="lab">Commission YTD</div>
              <div className="v">€12k</div>
              <div className="ft">↑ 15% vs last year</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Employer accounts */}
            <div className="card">
              <div className="card-h">
                <h3>My Employers</h3>
                <span className="lnk">View all →</span>
              </div>
              <div className="card-b">
                <table>
                  <thead>
                    <tr>
                      <th>Employer</th>
                      <th>Country</th>
                      <th>Orders</th>
                      <th>Placements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employers.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div className="cell-name">
                            <div className="av-sm">{e.initials}</div>
                            <div>
                              <div className="nm">{e.name}</div>
                              <div className="meta">{e.contact}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="flag">
                            <span className="fc">{e.country.slice(0, 2).toUpperCase()}</span>
                            {e.country}
                          </span>
                        </td>
                        <td className="mono" style={{ fontWeight: 600 }}>{e.orders}</td>
                        <td className="mono" style={{ fontWeight: 600, color: 'var(--green)' }}>
                          {e.placements}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Open orders */}
            <div className="split-col">
              <div className="card">
                <div className="card-h">
                  <h3>Open Orders</h3>
                  <span className="lnk">View all →</span>
                </div>
                <div className="card-b">
                  <table>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <div className="nm" style={{ fontWeight: 600 }}>{o.employer}</div>
                            <div className="meta" style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                              {o.country} · {o.id}
                            </div>
                          </td>
                          <td>
                            {o.role}
                            <div
                              className="mono"
                              style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}
                            >
                              {o.filled}/{o.headcount} filled
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={o.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commission breakdown */}
              <div className="card">
                <div className="card-h">
                  <h3>Commission Pipeline</h3>
                </div>
                <div className="card-pad">
                  <div className="bars">
                    {[
                      { label: 'Jan–Mar', pct: 60, n: '€3.2k' },
                      { label: 'Apr–Jun', pct: 80, n: '€4.8k' },
                      { label: 'Jul–Sep', pct: 35, n: '€2.1k' },
                      { label: 'Oct–Dec', pct: 20, n: '€1.9k' },
                    ].map((b) => (
                      <div key={b.label} className="barrow">
                        <div className="bl">{b.label}</div>
                        <div className="bt">
                          <div className="bf" style={{ width: `${b.pct}%` }} />
                        </div>
                        <div className="bn" style={{ width: 46, fontSize: 11 }}>{b.n}</div>
                      </div>
                    ))}
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
