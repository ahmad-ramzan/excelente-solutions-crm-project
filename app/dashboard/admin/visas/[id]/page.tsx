import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import Link from 'next/link';
import StatusBadge from '../../../../components/StatusBadge';

export default function VisaDetailPage({ params }: { params: { id: string } }) {
  const caseId = params.id || 'VP-501';

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section={caseId} />
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/dashboard/admin/visas">
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                ← Back to cases
              </button>
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px' }}>Bilal Ahmed</h1>
              <p className="ph-sub" style={{ fontSize: '13.5px', marginTop: '6px' }}>
                Case: {caseId} · ABC Construction · Russia <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>RU</span>
              </p>
            </div>
          </div>

          <div className="grid-2">
            <div className="split-col">
              {/* Profile Card */}
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
                <div className="av-sm" style={{ width: '48px', height: '48px', fontSize: '16px', background: 'var(--brand-soft)', color: 'var(--brand)', borderRadius: '12px' }}>
                  BA
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '2px' }}>Bilal Ahmed</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--slate)', marginBottom: '8px' }}>
                    Agent: Amir Khan · ABC Construction
                  </div>
                  <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none', lineHeight: '1.2' }}>• APPROVED</span>
                </div>
              </div>

              {/* Candidate Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidate documents</h3>
                  <span className="chip" style={{ background: '#e5f6ed', color: '#109856', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ FROM AGENT</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Passport scan</div>
                      <div className="dmeta">Front cover + all pages + back cover · Amir Khan</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
                    </div>
                  </div>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Health certificate</div>
                      <div className="dmeta">Uploaded by Amir Khan</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
                    </div>
                  </div>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Curriculum Vitae</div>
                      <div className="dmeta">3.1 MB</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visa Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Visa documents</h3>
                  <span className="chip" style={{ background: '#fff0db', color: '#b46d00', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ YOU UPLOAD</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Visa application slip</div>
                      <div className="dmeta">Uploaded by You</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
                    </div>
                  </div>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Visa approved document</div>
                      <div className="dmeta">Uploaded by You · visible to Agent & admin</div>
                    </div>
                    <div className="dright">
                      <span className="chip" style={{ background: '#e5f6ed', color: '#109856', border: 'none', fontSize: '10px', fontWeight: 700 }}>★ FINAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="split-col">
              {/* Visa Status */}
              <div className="card">
                <div className="card-h">
                  <h3>Visa status</h3>
                </div>
                <div className="card-b" style={{ padding: '22px' }}>
                  <div className="pipe" style={{ marginBottom: '32px' }}>
                    {[
                      { label: 'Available', icon: '✓', done: true },
                      { label: 'Selected', icon: '✓', done: true },
                      { label: 'Visa Processing', icon: '✓', done: true },
                      { label: 'Approved', icon: '✓', cur: true },
                    ].map((ps, idx) => {
                      const isLast = idx === 3;
                      return (
                        <div key={ps.label} className={`node ${ps.done ? 'done' : ps.cur ? 'cur' : ''}`}>
                          <div className="stamp" style={{ 
                            color: ps.done ? 'var(--green)' : ps.cur ? 'var(--brand)' : 'var(--muted)', 
                            borderColor: ps.done ? 'var(--green)' : ps.cur ? 'var(--brand)' : 'var(--line)',
                            background: ps.done ? 'transparent' : ps.cur ? 'var(--brand-soft)' : 'var(--card)'
                          }}>
                            {ps.icon}
                          </div>
                          <div className="lab">{ps.label}</div>
                          {!isLast && <div className="bar" style={{ background: ps.done ? 'var(--green)' : 'var(--line)' }} />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="field">
                    <label style={{ fontSize: '11px', color: 'var(--slate)' }}>Update status</label>
                    <div style={{ position: 'relative' }}>
                      <select className="input" defaultValue="Approved" style={{ appearance: 'none', paddingRight: '36px' }}>
                        <option>Available</option>
                        <option>Selected</option>
                        <option>Visa Processing</option>
                        <option>Approved</option>
                      </select>
                      <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '12px' }}>▼</div>
                    </div>
                  </div>

                  <div className="field">
                    <label style={{ fontSize: '11px', color: 'var(--slate)' }}>Remarks</label>
                    <textarea className="input" defaultValue="Visa stamped, travel booked" style={{ minHeight: '80px', resize: 'vertical' }} />
                  </div>

                  <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }}>Save update</button>
                </div>
              </div>

              {/* Parties */}
              <div className="card">
                <div className="card-h">
                  <h3>Parties</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Candidate</div>
                      <div className="v">Bilal Ahmed</div>
                    </div>
                    <div className="r">
                      <div className="k">Agent</div>
                      <div className="v">Amir Khan</div>
                    </div>
                    <div className="r">
                      <div className="k">Employer</div>
                      <div className="v">ABC Construction</div>
                    </div>
                    <div className="r">
                      <div className="k">Lawyer</div>
                      <div className="v">Elena Puflova</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Russia Visa Requirements */}
              <div className="card">
                <div className="card-h">
                  <h3>Russia visa requirements</h3>
                </div>
                <div className="card-b" style={{ padding: '18px 22px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--slate)', lineHeight: 1.5, marginBottom: '16px' }}>
                    Requirements are configured per country, as other markets may need different documents.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="chip" style={{ fontSize: '10.5px' }}>#passport scan</span>
                    <span className="chip" style={{ fontSize: '10.5px' }}>#health certificate</span>
                    <span className="chip" style={{ fontSize: '10.5px' }}>#visa application slip</span>
                    <span className="chip" style={{ fontSize: '10.5px' }}>#approved visa</span>
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
