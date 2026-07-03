import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function PositionsPage() {
  const supabase = await createClient();

  const { data: positions } = await supabase
    .from('positions')
    .select('*')
    .order('name');

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
              <Link href="/dashboard/admin/positions/new">
                <button className="btn btn-gold">+ Add position</button>
              </Link>
            </div>
          </div>

          <div className="resp-grid-cards" style={{ marginTop: '22px' }}>

            {positions?.map((pos) => (
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
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{pos.name}</h3>
                  <div className="mono" style={{ color: 'var(--slate)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    {pos.id}
                  </div>
                </div>
                <Link href={`/dashboard/admin/positions/${pos.id}`}>
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
                </Link>
              </div>
            ))}
            {positions?.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '20px' }}>No positions found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
