import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LawyerCasesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Find Lawyer's primary country (lawyer_countries table)
  const { data: lcData } = await supabase
    .from('lawyer_countries')
    .select('country_id, countries(name)')
    .eq('profile_id', user.id)
    .limit(1);

  const countryData = lcData && lcData.length > 0 ? (lcData[0].countries as any) : null;
  const countryName = countryData
    ? (Array.isArray(countryData) ? countryData[0]?.name : countryData?.name)
    : 'your assigned country';

  // Fetch Cases for this Lawyer
  const { data: dbCases } = await supabase
    .from('visa_cases')
    .select('id, public_code, status, remarks, candidates(public_code, first_name, last_name), employers(name), agent_id')
    .eq('lawyer_id', user.id)
    .order('opened_at', { ascending: false });

  // Get agent profiles
  const agentIds = Array.from(new Set((dbCases || []).map(c => c.agent_id).filter(Boolean)));
  let agentsMap: Record<string, string> = {};
  if (agentIds.length > 0) {
    const { data: agentsData } = await supabase
      .from('profiles')
      .select('id, raw_user_meta_data')
      .in('id', agentIds);

    (agentsData || []).forEach(a => {
      // @ts-ignore
      agentsMap[a.id] = a.raw_user_meta_data?.full_name || 'Agent';
    });
  }

  const cases = (dbCases || []).map((c: any) => ({
    id: c.id,
    public_code: c.public_code,
    candidate_code: c.candidates?.public_code,
    initials: `${c.candidates?.first_name?.[0] || ''}${c.candidates?.last_name?.[0] || ''}`.toUpperCase(),
    name: `${c.candidates?.first_name} ${c.candidates?.last_name}`,
    agent: c.agent_id ? agentsMap[c.agent_id] || 'Agent' : 'None',
    employer: c.employers?.name || 'Unknown',
    remarks: c.remarks || 'No remarks',
    status: c.status,
    statusColor: c.status === 'approved' ? '#008a3d' : c.status === 'rejected' ? '#e11d48' : '#b46d00',
    statusBg: c.status === 'approved' ? '#dcf4e6' : c.status === 'rejected' ? '#ffe4e6' : '#fef1d8'
  }));

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Assigned cases" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1>Assigned cases</h1>
              <p className="ph-sub">{cases.length} visa cases for {countryName}.</p>
            </div>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CASE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>AGENT</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>REMARKS</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
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
                        {c.agent}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13.5px' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13px' }}>
                        {c.remarks}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <span className="tag" style={{ background: c.statusBg, color: c.statusColor, border: 'none' }}>
                          • {c.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <Link href={`/dashboard/lawyer/cases/${c.public_code}`}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                            →
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
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
