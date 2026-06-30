import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';

export default function AgentDashboard() {
  const candidates = [
    {
      id: 'CND-2041',
      initials: 'BA',
      name: 'Bilal Ahmed',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Driver', 'Security Guard'],
      employer: 'ABC Construction',
      status: 'APPROVED',
      statusColor: '#008a3d',
      statusBg: '#dcf4e6'
    },
    {
      id: 'CND-2042',
      initials: 'HI',
      name: 'Hamza Iqbal',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Welder'],
      employer: 'ABC Construction',
      status: 'VISA PROCESSING',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    },
    {
      id: 'CND-2043',
      initials: 'UR',
      name: 'Usman Riaz',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Welder', 'Driver'],
      employer: 'ABC Construction',
      status: 'SELECTED',
      statusColor: '#3b82f6',
      statusBg: '#eff6ff'
    }
  ];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Agent overview</h1>
              <p className="ph-sub">Your candidates and where each one stands.</p>
            </div>
          </div>

          {/* Action Required Alert Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px 20px', 
            background: '#f5f3ff', 
            border: '1px solid #e1d4fc', 
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: 'var(--brand)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0
              }}>
                !
              </div>
              <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--ink)' }}>2 candidates need documents.</strong> Usman Riaz and Hamza Iqbal were selected — upload passport scans and health certificates to keep visas moving.
              </div>
            </div>
            <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', color: '#fff', fontSize: '13px', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, flexShrink: 0 }}>
              Review
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)' }}>My candidates</div>
              <div className="v" style={{ color: '#fff' }}>6</div>
            </div>
            <div className="stat">
              <div className="lab">Available</div>
              <div className="v">3</div>
            </div>
            <div className="stat">
              <div className="lab">Selected</div>
              <div className="v">1</div>
            </div>
            <div className="stat">
              <div className="lab">Visa processing</div>
              <div className="v">1</div>
            </div>
            <div className="stat">
              <div className="lab">Approved</div>
              <div className="v">1</div>
            </div>
          </div>

          {/* My Candidates Table */}
          <div className="card">
            <div className="card-h">
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>My candidates</h3>
              <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>View all</span>
            </div>
            <div className="card-b" style={{ padding: '0 22px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>CANDIDATE</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>COUNTRY</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>POSITIONS</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>EMPLOYER</th>
                    <th style={{ padding: '16px 0', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', textAlign: 'left' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i === candidates.length - 1 ? 'none' : '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 0' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            {c.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                              {c.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{c.country}</span> 
                        <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{c.countryCode}</span>
                      </td>
                      <td style={{ padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {c.positions.map(p => (
                            <span key={p} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 0', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 0' }}>
                         <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                           • {c.status}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
