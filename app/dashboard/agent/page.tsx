import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { candidates, documents } from '../../lib/mock-data';

export default function AgentDashboard() {
  // Agent Amir Khan's candidates
  const myCandidates = candidates.filter((c) => c.agent === 'Amir Khan');

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="My Candidates" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Agent Dashboard</h1>
              <p className="ph-sub">
                You have {myCandidates.length} registered candidates across your markets.
              </p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">Import CSV</button>
              <button className="btn btn-gold btn-sm">+ Add Candidate</button>
            </div>
          </div>

          <div className="stats">
            <div className="stat accent">
              <div className="lab">My Candidates</div>
              <div className="v">{myCandidates.length}</div>
              <div className="ft">↑ 2 this week</div>
            </div>
            <div className="stat">
              <div className="lab">Available</div>
              <div className="v">{myCandidates.filter((c) => c.status === 'available').length}</div>
              <div className="ft">Ready for selection</div>
            </div>
            <div className="stat">
              <div className="lab">Selected</div>
              <div className="v">{candidates.filter((c) => c.status === 'selected').length}</div>
              <div className="ft" style={{ color: 'var(--blue)' }}>Employer confirmed</div>
            </div>
            <div className="stat">
              <div className="lab">Placed YTD</div>
              <div className="v">24</div>
              <div className="ft">↑ 8 vs last year</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Candidate table */}
            <div className="card">
              <div className="card-h">
                <h3>My Candidates</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="lnk">Filter ▾</span>
                  <span className="lnk">View all →</span>
                </div>
              </div>
              <div className="card-b">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Trade</th>
                      <th>Market</th>
                      <th>Docs</th>
                      <th>Status</th>
                      <th></th>
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
                              <div className="meta">{c.id}</div>
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
                          <span
                            title="Passport"
                            style={{ marginRight: 4, opacity: c.passport ? 1 : 0.3 }}
                          >
                            🛂
                          </span>
                          <span
                            title="Medical"
                            style={{ marginRight: 4, opacity: c.medical ? 1 : 0.3 }}
                          >
                            🏥
                          </span>
                          <span title="CV" style={{ opacity: c.cv ? 1 : 0.3 }}>
                            📄
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <button className="ico-btn">✏️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="split-col">
              {/* Upload panel */}
              <div className="card">
                <div className="card-h">
                  <h3>Upload Documents</h3>
                </div>
                <div className="card-pad">
                  <div className="drop">
                    <div className="di">📤</div>
                    <b>Drop files here or click to upload</b>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      PDF, JPG, PNG · Max 10 MB
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    {documents.map((d) => (
                      <div key={d.name} className="doc">
                        <div className="dic">PDF</div>
                        <div>
                          <div className="dnm">{d.name}</div>
                          <div className="dmeta">
                            {d.status === 'ok'
                              ? `Uploaded ${d.date}`
                              : d.status === 'pending'
                              ? 'Pending review'
                              : 'Missing'}
                          </div>
                        </div>
                        <div className="dright">
                          {d.status === 'ok' ? (
                            <span className="tag t-approve">OK</span>
                          ) : d.status === 'pending' ? (
                            <span className="tag t-pending">Pending</span>
                          ) : (
                            <span className="tag t-avail">Missing</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="card">
                <div className="card-h">
                  <h3>Top Trades</h3>
                </div>
                <div className="card-pad">
                  <div className="bars">
                    {[
                      { label: 'Welding', pct: 75, n: '18' },
                      { label: 'Driving', pct: 55, n: '13' },
                      { label: 'Electrical', pct: 40, n: '9' },
                      { label: 'Cooking', pct: 20, n: '5' },
                    ].map((b) => (
                      <div key={b.label} className="barrow">
                        <div className="bl">{b.label}</div>
                        <div className="bt">
                          <div className="bf" style={{ width: `${b.pct}%` }} />
                        </div>
                        <div className="bn">{b.n}</div>
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
