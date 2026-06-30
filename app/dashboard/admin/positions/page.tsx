import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function PositionsPage() {
  const positions = [
    { id: '100', title: 'Driver', code: 'POS-100' },
    { id: '101', title: 'Cleaner', code: 'POS-101' },
    { id: '102', title: 'Welder', code: 'POS-102' },
    { id: '103', title: 'Electrician', code: 'POS-103' },
    { id: '104', title: 'Chef', code: 'POS-104' },
    { id: '105', title: 'Security Guard', code: 'POS-105' },
    { id: '106', title: 'Mason', code: 'POS-106' },
    { id: '107', title: 'Plumber', code: 'POS-107' },
  ];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Positions" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Positions</h1>
              <p className="ph-sub">Job roles candidates can apply for.</p>
            </div>
            <div className="ph-act">
              <button className="btn btn-gold">+ Add position</button>
            </div>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
              gap: '20px', 
              marginTop: '22px' 
            }}
          >
            {positions.map((pos) => (
              <div 
                key={pos.id} 
                className="card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{pos.title}</h3>
                  <div className="mono" style={{ color: 'var(--slate)', fontSize: '13px' }}>
                    {pos.code}
                  </div>
                </div>
                <button 
                  className="btn btn-ghost" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    padding: 0, 
                    display: 'inline-flex', 
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
