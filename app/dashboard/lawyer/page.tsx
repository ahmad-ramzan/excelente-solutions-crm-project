import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { candidates, documents } from '../../lib/mock-data';

const visaCases = [
  { candidate: candidates[2], stage: 3 },  // Giorgi — visa processing
  { candidate: candidates[3], stage: 4 },  // Ion — approved
  { candidate: candidates[0], stage: 2 },  // Ali — selected
];

const pipelineStages = [
  { label: 'Docs Received', icon: '📄' },
  { label: 'Application Filed', icon: '📝' },
  { label: 'Embassy Review', icon: '🏛️' },
  { label: 'Visa Issued', icon: '✅' },
];

export default function LawyerDashboard() {
  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Visa Pipeline" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Legal Dashboard</h1>
              <p className="ph-sub">
                Visa processing pipeline · Greece jurisdiction
              </p>
            </div>
            <div className="ph-act">
              <button className="btn btn-ghost btn-sm">Download Report</button>
              <button className="btn btn-gold btn-sm">+ New Application</button>
            </div>
          </div>

          <div className="stats">
            <div className="stat accent">
              <div className="lab">Active Visa Cases</div>
              <div className="v">6</div>
              <div className="ft">↑ 2 this week</div>
            </div>
            <div className="stat">
              <div className="lab">Embassy Review</div>
              <div className="v">3</div>
              <div className="ft" style={{ color: 'var(--amber)' }}>Awaiting decision</div>
            </div>
            <div className="stat">
              <div className="lab">Approved (YTD)</div>
              <div className="v">41</div>
              <div className="ft">↑ 12% vs last year</div>
            </div>
            <div className="stat">
              <div className="lab">Avg. Processing</div>
              <div className="v">18d</div>
              <div className="ft">↓ 3 days vs last yr</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Visa pipeline cases */}
            <div className="card">
              <div className="card-h">
                <h3>Active Cases</h3>
                <span className="lnk">View all →</span>
              </div>
              <div className="card-b">
                {visaCases.map(({ candidate: c, stage }) => (
                  <div key={c.id} style={{ padding: '18px 22px', borderBottom: '1px solid var(--line-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div className="cell-name">
                        <div className="av-sm">{c.initials}</div>
                        <div>
                          <div className="nm">{c.name}</div>
                          <div className="meta">{c.nationality} · {c.trade} · {c.country}</div>
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    {/* Pipeline stamps */}
                    <div className="pipe">
                      {pipelineStages.map((ps, idx) => {
                        const isDone = idx + 1 < stage;
                        const isCur = idx + 1 === stage;
                        const isLast = idx === pipelineStages.length - 1;
                        return (
                          <div key={ps.label} className={`node ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                            <div className="stamp">{ps.icon}</div>
                            <div className="lab">{ps.label}</div>
                            {!isLast && <div className="bar" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="split-col">
              {/* Document checklist */}
              <div className="card">
                <div className="card-h">
                  <h3>Documents — {visaCases[0].candidate.name}</h3>
                  <button className="btn btn-ghost btn-sm">Upload</button>
                </div>
                <div className="card-pad">
                  {documents.map((d) => (
                    <div key={d.name} className="doc">
                      <div className="dic">{d.type}</div>
                      <div>
                        <div className="dnm">{d.name}</div>
                        <div className="dmeta">
                          {d.status === 'ok'
                            ? `Filed ${d.date}`
                            : d.status === 'pending'
                            ? 'Awaiting upload'
                            : '⚠ Required — missing'}
                        </div>
                      </div>
                      <div className="dright">
                        {d.status === 'ok' ? (
                          <span className="tag t-approve">Filed</span>
                        ) : d.status === 'pending' ? (
                          <span className="tag t-pending">Pending</span>
                        ) : (
                          <span className="tag t-visa">Required</span>
                        )}
                        {d.status !== 'missing' && (
                          <button className="ico-btn">↓</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div className="card">
                <div className="card-h">
                  <h3>Upload to Case</h3>
                </div>
                <div className="card-pad">
                  <div className="drop">
                    <div className="di">📤</div>
                    <b>Drop visa documents here</b>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      PDF only · Embassy-stamped originals preferred
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
