import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';

export default function EmployerDashboard() {
  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>ABC Construction</h1>
              <p className="ph-sub">Recruitment for your Russia operations.</p>
            </div>
          </div>

          {/* Info Alert Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 20px', 
            background: '#f5f3ff', 
            border: '1px solid #e1d4fc', 
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'var(--brand)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>
            </div>
            <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
              You're viewing the <strong style={{ color: 'var(--ink)' }}>Russia</strong> market. You can only see candidates cleared for Russia — that keeps every shortlist relevant to your visas.
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>Open Job Offers</div>
              <div className="v" style={{ color: '#fff' }}>1</div>
            </div>
            
            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Staff needed</div>
              <div className="v">50</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Staff selected</div>
              <div className="v" style={{ marginBottom: '8px' }}>21</div>
              <div style={{ color: 'var(--green)', fontSize: '12.5px', fontWeight: 600 }}>29 remaining</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Available to view</div>
              <div className="v" style={{ marginBottom: '8px' }}>3</div>
              <div style={{ color: 'var(--green)', fontSize: '12.5px', fontWeight: 600 }}>in Russia</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>My selections</div>
              <div className="v">3</div>
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
            {/* Left Column: Candidates */}
            <div className="card">
              <div className="card-h">
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Available candidates · Russia</h3>
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>Browse all</span>
              </div>
              <div className="card-b" style={{ padding: '0 22px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>CANDIDATE</th>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>POSITIONS</th>
                      <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>STATUS</th>
                      <th style={{ padding: '16px 0', borderBottom: '1px solid var(--line-2)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Candidate 1 */}
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            SM
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Saad Mahmood</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>Electrician</span>
                          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>Welder</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                         <span className="tag" style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}>
                           • AVAILABLE
                         </span>
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', marginRight: '8px' }}>View</span>
                          <button className="btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}>
                            Select
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Candidate 2 */}
                    <tr>
                      <td style={{ padding: '16px 0' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            KY
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Kamran Yousaf</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>Driver</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                         <span className="tag" style={{ background: '#f1f5f9', color: '#475569', border: 'none' }}>
                           • AVAILABLE
                         </span>
                      </td>
                      <td style={{ padding: '16px 0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer', marginRight: '8px' }}>View</span>
                          <button className="btn" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}>
                            Select
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Order summary */}
            <div className="card" style={{ height: 'fit-content' }}>
              <div className="card-h">
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Order: Driver × 50</h3>
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>View slots</span>
              </div>
              <div className="card-b" style={{ padding: '24px' }}>
                
                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <span style={{ color: 'var(--slate)', fontSize: '13px', fontWeight: 600 }}>Filled</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, margin: '0 16px' }}>
                     <div style={{ width: '100%', height: '6px', background: 'var(--line-2)', borderRadius: '999px', overflow: 'hidden' }}>
                       <div style={{ width: '42%', height: '100%', background: 'var(--brand)', borderRadius: '999px' }}></div>
                     </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>21/50</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--slate)', fontSize: '13px' }}>Country</span>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>Russia</span> 
                      <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>RU</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--slate)', fontSize: '13px' }}>Start date</span>
                    <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>01 Aug 2026</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--slate)', fontSize: '13px' }}>End date</span>
                    <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>01 Feb 2027</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--slate)', fontSize: '13px' }}>Contract signed</span>
                    <span className="tag" style={{ background: '#dcf4e6', color: '#008a3d', border: 'none', padding: '2px 8px', fontSize: '11px' }}>
                       • YES
                    </span>
                  </div>
                </div>

                <button className="btn" style={{ width: '100%', background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                  Manage position slots
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
