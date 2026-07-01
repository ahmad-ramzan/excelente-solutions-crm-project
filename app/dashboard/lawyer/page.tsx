import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';

export default async function LawyerDashboard() {
  const supabase = await createClient();

  // Fetch Cases for this Lawyer
  const { data: dbCases } = await supabase.from('visa_cases').select('id, status, remarks, candidates(first_name, last_name), employers(name)').limit(5);
  
  const cases = (dbCases || []).map((c: any) => ({
    id: c.id,
    initials: `${c.candidates?.first_name?.[0] || ''}${c.candidates?.last_name?.[0] || ''}`.toUpperCase(),
    name: `${c.candidates?.first_name} ${c.candidates?.last_name}`,
    employer: c.employers?.name || 'Unknown',
    status: c.status,
    statusColor: c.status === 'APPROVED' ? '#008a3d' : '#b46d00',
    statusBg: c.status === 'APPROVED' ? '#dcf4e6' : '#fef1d8'
  }));


  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Legal overview</h1>
              <p className="ph-sub">Visa casework assigned to you for Russia.</p>
            </div>
          </div>

          {/* Info Alert Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '16px 20px', 
            background: '#f5f3ff', 
            border: '1px solid #e1d4fc', 
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'var(--brand)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <div style={{ color: 'var(--slate)', fontSize: '14.5px', lineHeight: '1.5' }}>
              You handle <strong style={{ color: 'var(--ink)' }}>Russia</strong> cases only. New selections in your country arrive here automatically with the candidate's documents attached.
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>Pending cases</div>
              <div className="v" style={{ color: '#fff' }}>1</div>
            </div>
            
            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Documents received</div>
              <div className="v">1</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Submitted</div>
              <div className="v">1</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Approved</div>
              <div className="v">1</div>
            </div>
          </div>

          {/* Assigned cases table */}
          <div className="card" style={{ border: 'none', background: 'transparent' }}>
            <div className="card-h" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Assigned cases · Russia</h3>
              <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>View all</span>
            </div>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CASE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                      <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        {c.id}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            {c.initials}
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                           • {c.status}
                         </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <button className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
