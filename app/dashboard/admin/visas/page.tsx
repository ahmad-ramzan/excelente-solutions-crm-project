import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function VisaProcessesPage() {
  const visaCases = [
    {
      id: 'VP-501',
      candidateInitials: 'BA',
      candidateName: 'Bilal Ahmed',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Visa stamped, travel booked',
      status: 'APPROVED',
      statusColor: '#008a3d',
      statusBg: '#dcf4e6'
    },
    {
      id: 'VP-502',
      candidateInitials: 'HI',
      candidateName: 'Hamza Iqbal',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Application lodged at consulate',
      status: 'SUBMITTED',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    },
    {
      id: 'VP-503',
      candidateInitials: 'UR',
      candidateName: 'Usman Riaz',
      agent: 'Amir Khan',
      employer: 'ABC Construction',
      remarks: 'Awaiting passport scan',
      status: 'DOCS REQUESTED',
      statusColor: '#b46d00',
      statusBg: '#f6ebd7'
    }
  ];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Visa processes" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Visa processes</h1>
              <p className="ph-sub">3 visa cases across all countries.</p>
            </div>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent', marginTop: '32px' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', width: '80px' }}>CASE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>AGENT</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', width: '220px' }}>REMARKS</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)', width: '160px' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visaCases.map((vc) => {
                    const [casePrefix, caseNum] = vc.id.split('-');
                    
                    return (
                      <tr key={vc.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)' }}>
                          {casePrefix}-<br/>{caseNum}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <div className="cell-name">
                            <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                              {vc.candidateInitials}
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                              {vc.candidateName.split(' ')[0]}<br />{vc.candidateName.split(' ').slice(1).join(' ')}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {vc.agent.split(' ')[0]}<br />{vc.agent.split(' ').slice(1).join(' ')}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--brand)' }}>
                          {vc.employer.split(' ')[0]}<br />{vc.employer.split(' ').slice(1).join(' ')}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)', fontSize: '13px' }}>
                           {/* Limit remarks width for wrapping like in screenshot */}
                          <div style={{ maxWidth: '140px', lineHeight: '1.4' }}>
                             {vc.remarks}
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                           <span className="tag" style={{ background: vc.statusBg, color: vc.statusColor, border: 'none', lineHeight: '1.2' }}>
                             • {vc.status.includes(' ') ? <>{vc.status.split(' ')[0]}<br/>{vc.status.split(' ').slice(1).join(' ')}</> : vc.status}
                           </span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent' }}>
                            →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
