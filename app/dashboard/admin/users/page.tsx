import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import StatusBadge from '../../../components/StatusBadge';

export default function UsersPage() {
  const usersData = [
    {
      id: '1',
      name: 'Daniel Roy',
      initials: 'DR',
      role: 'Salesperson',
      country: null,
      contact: 'daniel@exc.com',
      status: 'open',
    },
    {
      id: '2',
      name: 'Amir Khan',
      initials: 'AK',
      role: 'Agent',
      country: null,
      contact: 'amir@exc.com',
      status: 'open',
    },
    {
      id: '3',
      name: 'Sana Malik',
      initials: 'SM',
      role: 'Agent',
      country: null,
      contact: 'sana@exc.com',
      status: 'open',
    },
    {
      id: '4',
      name: 'Sergei Volkov',
      initials: 'SV',
      role: 'Employer',
      country: { name: 'Russia', code: 'RU' },
      contact: 'sergei@abc.ru',
      status: 'open',
    },
  ];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Users & roles" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Users &amp; roles</h1>
              <p className="ph-sub">Everyone with access to the platform.</p>
            </div>
            <div className="ph-act">
              <button className="btn btn-gold">+ Add user</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--line-2)', marginBottom: '24px', fontSize: '14.5px' }}>
            <div style={{ paddingBottom: '12px', borderBottom: '2px solid var(--gold)', color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>All</div>
            <div style={{ paddingBottom: '12px', color: 'var(--slate)', fontWeight: 600, cursor: 'pointer' }}>Salespersons</div>
            <div style={{ paddingBottom: '12px', color: 'var(--slate)', fontWeight: 600, cursor: 'pointer' }}>Agents</div>
            <div style={{ paddingBottom: '12px', color: 'var(--slate)', fontWeight: 600, cursor: 'pointer' }}>Employers</div>
            <div style={{ paddingBottom: '12px', color: 'var(--slate)', fontWeight: 600, cursor: 'pointer' }}>Lawyers</div>
          </div>

          <div className="card">
            <div className="card-b">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Country</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="cell-name">
                          <div className="av-sm">
                            {u.initials}
                          </div>
                          <div className="nm">{u.name}</div>
                        </div>
                      </td>
                      <td>
                        <span className="chip gold">{u.role}</span>
                      </td>
                      <td>
                        {u.country ? (
                          <span className="flag">
                            {u.country.name} <span className="fc">{u.country.code}</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="mono" style={{ color: 'var(--slate)' }}>
                        {u.contact}
                      </td>
                      <td>
                        <StatusBadge status={u.status as any} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="ico-btn">✏️</button>
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
