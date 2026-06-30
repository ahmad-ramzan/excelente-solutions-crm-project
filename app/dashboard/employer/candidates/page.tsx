import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function EmployerCandidatesPage() {
  const candidates = [
    {
      id: 'CND-2041',
      initials: 'BA',
      name: 'Bilal Ahmed',
      nationality: 'Pakistani',
      positions: ['Driver', 'Security Guard'],
      status: 'APPROVED',
      statusColor: '#008a3d',
      statusBg: '#dcf4e6'
    },
    {
      id: 'CND-2042',
      initials: 'HI',
      name: 'Hamza Iqbal',
      nationality: 'Pakistani',
      positions: ['Welder'],
      status: 'VISA PROCESSING',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    },
    {
      id: 'CND-2043',
      initials: 'UR',
      name: 'Usman Riaz',
      nationality: 'Pakistani',
      positions: ['Driver'],
      status: 'SELECTED',
      statusColor: '#3b82f6',
      statusBg: '#eff6ff'
    },
    {
      id: 'CND-2044',
      initials: 'SM',
      name: 'Saad Mahmood',
      nationality: 'Pakistani',
      positions: ['Electrician', 'Welder'],
      status: 'AVAILABLE',
      statusColor: '#475569',
      statusBg: '#f1f5f9'
    }
  ];

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Browse candidates" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1>Browse candidates</h1>
              <p className="ph-sub">Candidates cleared for Russia. Select one to reserve them instantly.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Showing Russia
              <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none' }}>RU</span>
            </div>
          </div>

          {/* Privacy Alert Box */}
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
              Contact details — phone, email and address — are visible to administrators only. You'll see everything needed to assess fit.
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <button style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--brand)', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>All positions</button>
            <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Driver</button>
            <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Welder</button>
            <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Electrician</button>
            <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Security Guard</button>
          </div>

          {/* Candidate Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {candidates.map((c) => {
              const isAvailable = c.status === 'AVAILABLE';

              return (
                <div key={c.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
                  {/* Top Header - Gradient */}
                  <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none', padding: '4px 8px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        • {c.status}
                      </span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '48px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', opacity: 0.9 }}>
                      {c.initials}
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '16px', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)', marginBottom: '16px' }}>
                      {c.id} <span style={{ color: 'var(--line-2)' }}>·</span> {c.nationality}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', flex: 1 }}>
                      {c.positions.map(p => (
                        <span key={p} style={{ fontSize: '11.5px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: '#fff', color: 'var(--slate)' }}>
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    {isAvailable ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600 }}>
                          View
                        </button>
                        <button className="btn" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600 }}>
                          Select
                        </button>
                      </div>
                    ) : (
                      <button className="btn" style={{ width: '100%', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600 }}>
                        View profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}
