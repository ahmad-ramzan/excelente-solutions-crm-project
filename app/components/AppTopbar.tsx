import { createClient, getAuthUser } from '@/utils/supabase/server';
import { signOut } from '@/app/dashboard/actions';
import NotificationBell from './NotificationBell';
import MobileMenuButton from './MobileMenuButton';

interface AppTopbarProps {
  section: string;
  role?: string;
  /** Placeholder text for the search box. Defaults to "Search {section}…". */
  searchPlaceholder?: string;
  /** Current value of the `q` param, so the box reflects an active search. */
  searchValue?: string;
}

export default async function AppTopbar({ section, role, searchPlaceholder, searchValue }: AppTopbarProps) {
  const user = await getAuthUser();

  let notifications: any[] = [];
  let unreadCount = 0;

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
        {/* No `action` — submits back to whatever page is currently open, so
            search results match the active page instead of always jumping
            to Candidates. Each page reads its own `q` param and filters. */}
        <form action="" method="GET" className="search">
          <span>🔍</span>
          <input name="q" placeholder={searchPlaceholder || `Search ${section.toLowerCase()}…`} defaultValue={searchValue} />
        </form>

        <NotificationBell notifications={notifications} unreadCount={unreadCount} />

        <form action={signOut}>
          <button type="submit" className="btn btn-ghost btn-sm">Sign out</button>
        </form>
      </div>
    </div>
  );
}
