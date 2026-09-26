import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import RestoreCandidateButton from '@/app/components/RestoreCandidateButton';

export default async function AgentTrashPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, public_code, first_name, last_name, deleted_at')
    .eq('agent_id', user.id)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  const list = candidates || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Trash" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Trash</h1>
              <p className="ph-sub">Candidates you've moved to trash. Restore them any time.</p>
            </div>
            <Link href="/dashboard/agent/candidates">
              <button className="btn btn-ghost">← Back to candidates</button>
            </Link>
          </div>

          <div className="card" style={{ marginTop: '24px', overflow: 'hidden' }}>
            {list.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 22px',
                  borderBottom: i === list.length - 1 ? 'none' : '1px solid var(--line-2)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {c.public_code} · Deleted {new Date(c.deleted_at as string).toLocaleDateString()}
                  </div>
                </div>
                <RestoreCandidateButton candidateId={c.id} />
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
