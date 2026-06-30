import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function EmployerSelectionsPage() {
  const candidates = [
    {
      id: 'CND-2041',
      initials: 'BA',
      name: 'Bilal Ahmed',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Driver', 'Security Guard'],
      employer: 'ABC Construction',
      status: 'APPROVED',
      statusColor: '#008a3d',
      statusBg: '#dcf4e6'
    },
    {
      id: 'CND-2042',
      initials: 'HI',
      name: 'Hamza Iqbal',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Welder'],
      employer: 'ABC Construction',
      status: 'VISA PROCESSING',
      statusColor: '#b46d00',
      statusBg: '#fef1d8'
    },
    {
      id: 'CND-2043',
      initials: 'UR',
      name: 'Usman Riaz',
      country: 'Russia',
      countryCode: 'RU',
      positions: ['Driver'],
      employer: 'ABC Construction',
      status: 'SELECTED',
      statusColor: '#3b82f6',
      statusBg: '#eff6ff'
    }
  ];

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="My selections" />
        <div className="wrap">
          <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1>Candidates</h1>
              <p className="ph-sub">3 candidates registered.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--brand)', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer' }}>All</button>
              <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Available</button>
              <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Selected</button>
              <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Visa processing</button>
              <button style={{ background: 'none', border: 'none', padding: '0 0 8px 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--slate)', cursor: 'pointer' }}>Approved</button>
            </div>
            <div>
              <select style={{ padding: '8px 32px 8px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%23111827%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                <option>All countries</option>
              </select>
            </div>
          </div>

          <div className="card" style={{ border: 'none', background: 'transparent' }}>
            <div className="card-b" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>POSITIONS</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                    <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>STATUS</th>
                    <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                      <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', width: '38px', height: '38px', borderRadius: '10px', fontSize: '13px' }}>
                            {c.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                              {c.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '13px' }}>{c.country}</span> 
                        <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '6px' }}>{c.countryCode}</span>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {c.positions.map(p => (
                            <span key={p} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--line-2)', background: 'var(--paper)', color: 'var(--slate)' }}>
                              {p}
                            </span>
                          ))}
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
