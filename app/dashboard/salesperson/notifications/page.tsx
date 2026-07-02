import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { markAllNotificationsRead } from '@/app/dashboard/notifications-actions';

export default async function SalespersonNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, body, type, created_at, read_at')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false });

  const list = notifications || [];

  async function handleMarkAll() {
    'use server';
    await markAllNotificationsRead();
  }

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
            <form action={handleMarkAll}>
              <button type="submit" className="btn" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px' }}>
                Mark all read
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
            {list.map((n, i) => {
              const isSuccess = n.type === 'order_milestone' || n.type === 'visa_approved';
              const iconColor = isSuccess ? 'var(--green)' : 'var(--brand)';
              const iconBg = isSuccess ? 'var(--green-soft, #e6f6ec)' : 'var(--brand-soft)';

              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '24px',
                    borderBottom: i === list.length - 1 ? 'none' : '1px solid var(--line)',
                    background: n.read_at ? 'var(--card)' : 'var(--paper, #f9f8f6)'
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
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
            {list.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
