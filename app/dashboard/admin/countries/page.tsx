import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';

export default function CountriesPage() {
  const countryData = [
    {
      id: 'ru',
      name: 'Russia',
      code: 'RU',
      employers: 3,
      lawyers: 1,
      candidates: 18,
    },
    {
      id: 'gr',
      name: 'Greece',
      code: 'GR',
      employers: 4,
      lawyers: 1,
      candidates: 24,
    },
    {
      id: 'pl',
      name: 'Poland',
      code: 'PL',
      employers: 2,
      lawyers: 2,
      candidates: 11,
    },
    {
      id: 'ro',
      name: 'Romania',
      code: 'RO',
      employers: 1,
      lawyers: 1,
      candidates: 7,
    },
  ];

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Countries" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Countries</h1>
              <p className="ph-sub">Destination markets candidates can be placed in.</p>
            </div>
            <div className="ph-act">
              <button className="btn btn-gold">+ Add country</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '22px' }}>
            <div className="card-b">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Code</th>
                    <th>Employers</th>
                    <th>Lawyers</th>
                    <th>Candidates</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {countryData.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="cell-name">
                          <div className="av-sm">
                            {c.id.toUpperCase()}
                          </div>
                          <div className="nm">{c.name}</div>
                        </div>
                      </td>
                      <td className="mono" style={{ color: 'var(--slate)' }}>
                        {c.code}
                      </td>
                      <td className="mono">{c.employers}</td>
                      <td className="mono" style={{ color: 'var(--teal)' }}>
                        {c.lawyers}
                      </td>
                      <td className="mono">{c.candidates}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-ghost" style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', justifyContent: 'center' }}>
                          ✏️
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
