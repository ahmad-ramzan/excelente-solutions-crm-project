import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function SalespersonNotificationsPage() {
  const notifications = [
    {
      id: 'n1',
      title: 'Order milestone',
      body: 'ABC Construction · Welder order is now fully staffed (30/30).',
      time: '3h ago',
      type: 'success',
      unread: true,
    },
    {
      id: 'n2',
      title: 'New selection',
      body: 'Helios Hotels selected a Chef candidate.',
      time: '1d ago',
      type: 'info',
      unread: false,
    }
  ];

  return (
    <>
      <AppSidebar role="salesperson" />
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
