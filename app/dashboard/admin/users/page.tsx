import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import StatusBadge from '../../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;
  const currentRole = params.role || 'all';

  let query = supabase
    .from('profiles')
    .select('id, full_name, role, email, phone, status, countries(name, code)')
    .order('created_at', { ascending: false });

  if (currentRole !== 'all') {
    query = query.eq('role', currentRole);
  }

  const { data: dbUsers } = await query;

  const users = (dbUsers || []).map(u => ({
    id: u.id,
    name: u.full_name,
    initials: u.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
    country: u.countries ? { name: (u.countries as any).name, code: (u.countries as any).code } : null,
    contact: u.email,
    status: u.status
  }));

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Users & roles" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Users &amp; roles</h1>
              <p className="ph-sub">Everyone with access to the platform.</p>
            </div>
            <div className="ph-act">
              <Link href="/dashboard/admin/users/new">
                <button className="btn btn-gold">+ Add user</button>
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--line-2)', marginBottom: '24px', fontSize: '14.5px' }}>
            {[
              { label: 'All', val: 'all' },
              { label: 'Salespersons', val: 'salesperson' },
              { label: 'Agents', val: 'agent' },
              { label: 'Employers', val: 'employer' },
              { label: 'Lawyers', val: 'lawyer' }
            ].map(t => (
              <Link key={t.val} href={`/dashboard/admin/users?role=${t.val}`}>
                <div style={{ 
                  paddingBottom: '12px', 
                  borderBottom: currentRole === t.val ? '2px solid var(--gold)' : 'none', 
                  color: currentRole === t.val ? 'var(--ink)' : 'var(--slate)', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}>
                  {t.label}
                </div>
              </Link>
            ))}
          </div>

          <div className="card">
            <div className="card-b">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Country</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="cell-name">
                          <div className="av-sm">
                            {u.initials}
                          </div>
                          <div className="nm">{u.name}</div>
                        </div>
                      </td>
                      <td>
                        <span className="chip gold">{u.role}</span>
                      </td>
                      <td>
                        {u.country ? (
                          <span className="flag">
                            {u.country.name} <span className="fc">{u.country.code}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="mono" style={{ color: 'var(--slate)' }}>
                        {u.contact}
                      </td>
                      <td>
                        <StatusBadge status={u.status as any} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/dashboard/admin/users/${u.id}`}>
                          <button className="ico-btn">✏️</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
