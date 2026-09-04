import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TeamPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order')
    .order('created_at');

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Our Team" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Our Team</h1>
              <p className="ph-sub">Shown on the public homepage's "Our Team" section.</p>
            </div>
            <div className="ph-act">
              <Link href="/dashboard/admin/team/new">
                <button className="btn btn-gold">+ Add team member</button>
              </Link>
            </div>
          </div>

          <div className="resp-grid-cards" style={{ marginTop: '22px' }}>
            {members?.map((m) => {
              const photoUrl = m.photo_path
                ? supabase.storage.from('team-photos').getPublicUrl(m.photo_path).data.publicUrl
                : null;

              return (
                <Link key={m.id} href={`/dashboard/admin/team/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '64px',
                        borderRadius: '8px',
                        border: '1px solid var(--line)',
                        background: photoUrl ? `url(${photoUrl})` : 'var(--paper)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted)',
                        fontSize: '10px',
                      }}
                    >
                      {!photoUrl && 'No photo'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--ink)' }}>{m.name}</h3>
                      <div style={{ color: 'var(--slate)', fontSize: '13px' }}>{m.position}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {members?.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '20px' }}>
                No team members yet — add one to show them on the homepage.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
