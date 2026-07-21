import { createClient, getAuthUser } from '@/utils/supabase/server';
import { signOut } from '@/app/dashboard/actions';
import NotificationBell from './NotificationBell';
import MobileMenuButton from './MobileMenuButton';

interface AppTopbarProps {
  section: string;
  role?: string;
}

const CANDIDATE_SEARCH_TARGETS: Record<string, string> = {
  admin: '/dashboard/admin/candidates',
  agent: '/dashboard/agent/candidates',
  employer: '/dashboard/employer/candidates',
};

export default async function AppTopbar({ section, role }: AppTopbarProps) {
  const user = await getAuthUser();

  let notifications: any[] = [];
  let unreadCount = 0;
  const searchTarget = role ? CANDIDATE_SEARCH_TARGETS[role] || null : null;

  if (user) {
    const supabase = await createClient();
    const { data: notifData } = await supabase
      .from('notifications')
      .select('id, title, body, created_at, read_at')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(8);

    notifications = notifData || [];
    unreadCount = notifications.filter(n => !n.read_at).length;
  }

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MobileMenuButton />
        <div className="crumb">
          Excelente Solutions{' '}
          <span style={{ margin: '0 6px', color: 'var(--line)' }}>/</span>
          <b>{section}</b>
        </div>
      </div>

      <div className="tb-r">
        {searchTarget ? (
          <form action={searchTarget} method="GET" className="search">
            <span>🔍</span>
            <input name="q" placeholder="Search candidates…" />
          </form>
        ) : (
          <div className="search">
            <span>🔍</span>
            <input placeholder="Search candidates, orders…" disabled />
          </div>
        )}

        <NotificationBell notifications={notifications} unreadCount={unreadCount} />

        <form action={signOut}>
          <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
        </form>
      </div>
    </div>
  );
}
