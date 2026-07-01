import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const cndId = params.id || 'CND-2041';

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Bilal Ahmed" />
        <div className="wrap">
          <div className="prof">
            
            {/* LEFT PROFILE CARD */}
            <div>
              <div className="prof-card">
                <div className="pp" style={{ color: '#ffffff' }}>BA</div>
                <div className="pi">
                  <h2>Bilal Ahmed</h2>
                  <div className="id">{cndId}</div>
                  <div style={{ marginTop: '14px' }}>
                    <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none', lineHeight: '1.2' }}>• APPROVED</span>
                  </div>
                </div>
                <div className="pact">
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Download CV</button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="split-col">
              
              {/* Application Status */}
              <div className="card">
                <div className="card-h">
                  <h3>Application status</h3>
                </div>
                <div className="card-b" style={{ padding: '32px 22px' }}>
                  <div className="pipe">
                    {[
                      { label: 'Available', icon: '✓', done: true },
                      { label: 'Selected', icon: '✓', done: true },
                      { label: 'Visa Processing', icon: '🏢', done: true },
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
                </div>
              </div>

              {/* Candidate information */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidate information</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Father's name</div>
                      <div className="v">Muhammad Ahmed</div>
                    </div>
                    <div className="r">
                      <div className="k">Date of birth</div>
                      <div className="v">1994-03-12</div>
                    </div>
                    <div className="r">
                      <div className="k">Gender</div>
                      <div className="v">Male</div>
                    </div>
                    <div className="r">
                      <div className="k">Nationality</div>
                      <div className="v">Pakistani</div>
                    </div>
                    <div className="r">
                      <div className="k">Destination</div>
                      <div className="v">Russia <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>RU</span></div>
                    </div>
                    <div className="r">
                      <div className="k">City of visa application</div>
                      <div className="v">Lahore</div>
                    </div>
                    <div className="r">
                      <div className="k">Assigned slot</div>
                      <div className="v">Driver Slot - ABC Construction</div>
                    </div>
                    <div className="r">
                      <div className="k">Positions applied</div>
                      <div className="v">
                        <span className="chip" style={{ marginRight: '4px' }}>Driver</span>
                        <span className="chip">Security Guard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passport */}
              <div className="card">
                <div className="card-h">
                  <h3>Passport</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Passport no.</div>
                      <div className="v">AK4471290</div>
                    </div>
                    <div className="r">
                      <div className="k">Expiry</div>
                      <div className="v">2030-08</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact information */}
              <div className="card">
                <div className="card-h">
                  <h3>Contact information</h3>
                </div>
                <div className="card-b" style={{ padding: '4px 0' }}>
                  <div className="kv" style={{ padding: '0 22px' }}>
                    <div className="r">
                      <div className="k">Phone</div>
                      <div className="v">+92 300 1234567</div>
                    </div>
                    <div className="r">
                      <div className="k">Email</div>
                      <div className="v">bilal@email.com</div>
                    </div>
                    <div className="r">
                      <div className="k">Address</div>
                      <div className="v">House 12, Lahore</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Documents</h3>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Curriculum Vitae</div>
                      <div className="dmeta">Uploaded by Amir Khan · 3.1 MB</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
                    </div>
                  </div>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Passport scan</div>
                      <div className="dmeta">Front cover + all pages + back cover</div>
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
                </div>
              </div>

              {/* Visa documents */}
              <div className="card">
                <div className="card-h">
                  <h3>Visa documents</h3>
                  <span className="chip" style={{ background: '#fff0db', color: '#b46d00', border: 'none', fontSize: '10px', fontWeight: 700 }}>↑ FROM LAWYER</span>
                </div>
                <div className="card-b" style={{ padding: '0 22px' }}>
                  <div className="doc">
                    <div className="dic" style={{ color: 'var(--red)', background: '#fee2e2', borderColor: '#fecaca' }}>PDF</div>
                    <div>
                      <div className="dnm">Visa application slip</div>
                      <div className="dmeta">Uploaded by lawyer · Elena Puflova</div>
                    </div>
                    <div className="dright">
                      <button className="ico-btn">↓</button>
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
