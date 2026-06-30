import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 'n1',
      title: 'Visa approved',
      body: 'Bilal Ahmed — visa approved by Elena Petrova (Russia).',
      time: '2h ago',
      type: 'success',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Candidate selected',
      body: 'ABC Construction selected Usman Riaz.',
      time: '5h ago',
      type: 'info',
      unread: false,
    },
    {
      id: 'n3',
      title: 'New Job Offer',
      body: 'Vistula Logistics · Driver × 20 created by Daniel Roy.',
      time: '1d ago',
      type: 'success',
      unread: false,
    }
  ];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Notifications" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Notifications</h1>
              <p className="ph-sub">Everything that needs your attention.</p>
            </div>
            <button className="btn" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px' }}>
              Mark all read
            </button>
          </div>

          <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
            {notifications.map((n, i) => {
              const isSuccess = n.type === 'success';
              const iconColor = isSuccess ? 'var(--green)' : 'var(--brand)';
              const iconBg = isSuccess ? 'var(--green-soft, #e6f6ec)' : 'var(--brand-soft)';

              return (
                <div 
                  key={n.id} 
                  style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    padding: '24px', 
                    borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--line)',
                    background: n.unread ? 'var(--paper, #f9f8f6)' : 'var(--card)' 
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: iconBg, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: iconColor }}></div>
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '14.5px', marginBottom: '4px' }}>
                      {n.title}
                    </div>
                    <div style={{ color: 'var(--slate)', fontSize: '13.5px', marginBottom: '8px' }}>
                      {n.body}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {n.time}
                    </div>
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
