import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LawyerDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Find Lawyer's primary country (lawyer_countries table)
  const { data: lcData } = await supabase
    .from('lawyer_countries')
    .select('country_id, countries(name)')
    .eq('lawyer_id', user.id)
    .limit(1);

  const lcCountry: any = lcData && lcData.length > 0 ? lcData[0].countries : null;
  const countryName = (Array.isArray(lcCountry) ? lcCountry[0]?.name : lcCountry?.name) || 'your assigned country';

  // Fetch Cases for this Lawyer
  const { data: dbCases } = await supabase
    .from('visa_cases')
    .select('id, public_code, status, remarks, candidates(first_name, last_name, public_code), employers(name)')
    .eq('lawyer_id', user.id)
    .order('opened_at', { ascending: false });
  
  const cases = (dbCases || []).map((c: any) => ({
    id: c.id,
    public_code: c.public_code,
    candidate_code: c.candidates?.public_code,
    initials: `${c.candidates?.first_name?.[0] || ''}${c.candidates?.last_name?.[0] || ''}`.toUpperCase(),
    name: `${c.candidates?.first_name} ${c.candidates?.last_name}`,
    employer: c.employers?.name || 'Unknown',
    status: c.status,
    statusColor: c.status === 'approved' ? '#008a3d' : c.status === 'rejected' ? '#e11d48' : '#b46d00',
    statusBg: c.status === 'approved' ? '#dcf4e6' : c.status === 'rejected' ? '#ffe4e6' : '#fef1d8'
  }));

  const pending = cases.filter(c => c.status === 'pending').length;
  const docsReceived = cases.filter(c => c.status === 'documents_received').length;
  const submitted = cases.filter(c => c.status === 'submitted').length;
  const approved = cases.filter(c => c.status === 'approved').length;

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Legal overview</h1>
              <p className="ph-sub">Visa casework assigned to you for {countryName}.</p>
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
              You handle <strong style={{ color: 'var(--ink)' }}>{countryName}</strong> cases only. New selections in your country arrive here automatically with the candidate's documents attached.
            </div>
          </div>

          {/* Stats Grid */}
          <div className="resp-grid-4">
            <div className="stat" style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px' }}>Pending cases</div>
              <div className="v" style={{ color: '#fff' }}>{pending}</div>
            </div>
            
            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Documents received</div>
              <div className="v">{docsReceived}</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Submitted</div>
              <div className="v">{submitted}</div>
            </div>

            <div className="stat" style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '24px', borderRadius: '12px' }}>
              <div className="lab" style={{ marginBottom: '12px' }}>Approved</div>
              <div className="v">{approved}</div>
            </div>
          </div>

          {/* Assigned cases table */}
          <div className="card" style={{ border: 'none', background: 'transparent' }}>
            <div className="card-h" style={{ padding: '0 0 24px 0', borderBottom: 'none' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Assigned cases · {countryName}</h3>
              <Link href="/dashboard/lawyer/cases">
                <span className="lnk" style={{ color: 'var(--brand)', fontWeight: 600 }}>View all</span>
              </Link>
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
                  {cases.slice(0, 5).map((c) => (
                    <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                      <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        {c.public_code}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            {c.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>{c.candidate_code}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                         <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                           • {c.status.replace('_', ' ').toUpperCase()}
                         </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <Link href={`/dashboard/lawyer/cases/${c.public_code}`}>
                          <button className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                            Open
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                        No cases assigned yet.
                      </td>
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
