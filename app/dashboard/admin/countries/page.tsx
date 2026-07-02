import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function CountriesPage() {
  const supabase = await createClient();

  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .order('name');

  // We could fetch counts for employers/lawyers/candidates per country but for now we'll just show the country list
  // Doing a complex join just for the counts might be overkill right now, but let's do a basic candidates count.
  const { data: candCounts } = await supabase.from('candidates').select('country_id');
  const countMap: Record<string, number> = {};
  candCounts?.forEach(c => {
    countMap[c.country_id] = (countMap[c.country_id] || 0) + 1;
  });

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
              <Link href="/dashboard/admin/countries/new">
                <button className="btn btn-gold">+ Add country</button>
              </Link>
            </div>
          </div>

          <div className="card" style={{ marginTop: '22px' }}>
            <div className="card-b">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Candidates</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {countries?.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="cell-name">
                          <div className="av-sm">
                            {c.code.toUpperCase()}
                          </div>
                          <div className="nm">{c.name}</div>
                        </div>
                      </td>
                      <td className="mono" style={{ color: 'var(--slate)' }}>
                        {c.code}
                      </td>
                      <td>
                        <span className="tag" style={{ background: c.is_active ? '#dcfce7' : 'var(--line-2)', color: c.is_active ? '#166534' : 'var(--slate)', border: 'none' }}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="mono">{countMap[c.id] || 0}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/dashboard/admin/countries/${c.id}`}>
                          <button className="btn btn-ghost" style={{ width: '32px', height: '32px', padding: 0, display: 'inline-flex', justifyContent: 'center' }}>
                            ✏️
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {countries?.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>No countries found.</td>
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
