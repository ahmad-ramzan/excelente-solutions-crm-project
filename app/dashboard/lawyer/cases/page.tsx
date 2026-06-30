import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function LawyerCasesPage() {
  const cases = [
    {
      id: 'VP-581',
      initials: 'BA',
      name: 'Bilal Ahmed',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Visa stamped, travel booked',
      status: 'APPROVED',
      statusColor: '#008a3d',
      statusBg: '#dcf4e6'
    },
    {
      id: 'VP-582',
      initials: 'HI',
      name: 'Hamza Iqbal',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Application lodged at consulate',
      status: 'SUBMITTED',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    },
    {
      id: 'VP-583',
      initials: 'UR',
      name: 'Usman Riaz',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Awaiting passport scan',
      status: 'DOCS REQUESTED',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    }
  ];

  return (
    <>
      <AppSidebar role="lawyer" />
      <div className="main">
        <AppTopbar section="Assigned cases" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1>Assigned cases</h1>
              <p className="ph-sub">3 visa cases for Russia.</p>
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
                           • {c.status}
                         </span>
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent' }}>
                          →
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
