import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import RestoreUserButton from '@/app/components/RestoreUserButton';
import PermanentlyDeleteUserButton from '@/app/components/PermanentlyDeleteUserButton';

export default async function UsersTrashPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, email, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  const list = users || [];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Users trash" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Users trash</h1>
              <p className="ph-sub">Deleted Agent / Employer / Lawyer / Salesperson accounts. Restore or permanently remove them.</p>
            </div>
            <Link href="/dashboard/admin/users">
              <button className="btn btn-ghost">← Back to users</button>
            </Link>
          </div>

          <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
            {list.map((u, i) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 22px',
                  borderBottom: i === list.length - 1 ? 'none' : '1px solid var(--line-2)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.full_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    <span className="chip gold" style={{ marginRight: '8px', textTransform: 'capitalize' }}>{u.role}</span>
                    {u.email} · Deleted {new Date(u.deleted_at as string).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <RestoreUserButton userId={u.id} />
                  <PermanentlyDeleteUserButton userId={u.id} userName={u.full_name} />
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                Trash is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
