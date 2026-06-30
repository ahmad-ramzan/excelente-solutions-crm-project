import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import StatusBadge from '../../../components/StatusBadge';
import { candidates } from '../../../lib/mock-data';

export default function CandidatesPage() {
  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Candidates" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Candidates</h1>
              <p className="ph-sub">{candidates.length} candidates registered.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', gap: '20px' }}>
              <div className="tab on" style={{ color: 'var(--brand)', borderBottomColor: 'var(--brand)', padding: '0 0 10px 0' }}>All</div>
              <div className="tab" style={{ padding: '0 0 10px 0' }}>Available</div>
              <div className="tab" style={{ padding: '0 0 10px 0' }}>Selected</div>
              <div className="tab" style={{ padding: '0 0 10px 0' }}>Visa processing</div>
              <div className="tab" style={{ padding: '0 0 10px 0' }}>Approved</div>
            </div>
            
            <select className="input" style={{ width: 'auto', minWidth: '160px', padding: '8px 12px', fontSize: '13px' }}>
              <option>All countries</option>
              <option>Russia</option>
              <option>Greece</option>
              <option>Poland</option>
              <option>Romania</option>
            </select>
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
                  {candidates.map((c, i) => {
                    // Mocks based on the screenshot, but use the data where possible
                    const empMap: Record<string, string> = {
                      'C-001': 'ABC Construction',
                      'C-002': 'XYZ Logistics',
                      'C-003': 'Hellenic Cuisine',
                      'C-004': 'EuroBuild'
                    };
                    const employer = empMap[c.id] || 'ABC Construction';
                    const countryCodes: Record<string, string> = {
                      'Russia': 'RU',
                      'Greece': 'GR',
                      'Poland': 'PL',
                      'Romania': 'RO',
                    };
                    const cCode = countryCodes[c.country] || 'XX';
                    
                    // The design shows the candidate ID like CND-2041
                    const cndNum = 2041 + i;

                    return (
                      <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                          <div className="cell-name">
                            <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                              {c.initials}
                            </div>
                            <div>
                              <div className="nm" style={{ marginBottom: '2px' }}>{c.name}</div>
                              <div className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--muted)' }}>CND - {cndNum}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.country}</span> <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{cCode}</span>
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <span className="chip">{c.trade}</span>
                          {c.skills && c.skills[0] && (
                            <span className="chip">{c.skills[0]}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {employer}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          <StatusBadge status={c.status} />
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <button className="ico-btn" style={{ fontSize: '12px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent' }}>
                            ...
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
