import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';
import { getDashboardStats } from '@/app/lib/queries';
import ExportButton from './ExportButton';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const stats = await getDashboardStats(supabase, 'admin');

  // Fetch Recent Candidates
  const { data: dbCandidates } = await supabase
    .from('candidate_public_view')
    .select('*')
    .limit(5)
    .order('created_at', { ascending: false });

  const candidates = (dbCandidates || []).map((c: any) => ({
    id: c.id,
    public_code: c.public_code,
    initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
    name: `${c.first_name} ${c.last_name}`,
    nationality: c.nationality,
    country: c.country_name || 'Unassigned',
    countryCode: c.country_code || '--',
    trade: c.positions?.[0] || 'N/A',
    agent_id: c.agent_id, // we should probably join profiles for agent name, let's just show 'Agent' for now if not joined
    agent: '',
    status: c.status
  }));

  // Fetch Agent Names for candidates
  const agentIds = Array.from(new Set(candidates.map(c => c.agent_id).filter(Boolean)));
  const agentMap: Record<string, string> = {};
  if (agentIds.length > 0) {
    const { data: agents } = await supabase.from('profiles').select('id, full_name').in('id', agentIds);
    agents?.forEach(a => agentMap[a.id] = a.full_name);
  }
  
  // Assign agent name
  candidates.forEach(c => c.agent = agentMap[c.agent_id] || 'N/A');

  // Fetch Country Breakdown
  const { data: countryData } = await supabase
    .from('candidates')
    .select('country_id, countries(name, code)');
  
  const countryCounts: Record<string, { count: number; name: string; code: string }> = {};
  let totalCountryCands = 0;
  
  countryData?.forEach(c => {
    if (c.countries) {
      const cid = c.country_id;
      if (!countryCounts[cid]) {
        countryCounts[cid] = { count: 0, name: (c.countries as any).name, code: (c.countries as any).code };
      }
      countryCounts[cid].count++;
      totalCountryCands++;
    }
  });

  const topCountries = Object.values(countryCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(c => ({
      label: c.name,
      code: c.code,
      pct: totalCountryCands > 0 ? Math.round((c.count / totalCountryCands) * 100) : 0,
      n: c.count.toString()
    }));

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Dashboard" />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Console overview</h1>
              <p className="ph-sub">Everything across all countries, roles and candidates.</p>
            </div>
            <div className="ph-act">
              <ExportButton />
            </div>
          </div>

          {/* Stats — Live from DB */}
          <div className="stats">
            <div className="stat accent">
              <div className="lab">Total candidates</div>
              <div className="v">{stats.total_candidates}</div>
              <div className="ft">Live metrics</div>
            </div>
            <div className="stat">
              <div className="lab">Available</div>
              <div className="v">{stats.candidates?.available || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Selected</div>
              <div className="v">{stats.candidates?.selected || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Visa processing</div>
              <div className="v">{stats.candidates?.visa_processing || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Approved</div>
              <div className="v">{stats.candidates?.approved || 0}</div>
            </div>
          </div>

          {/* Second row of stats */}
          <div className="stats">
            <div className="stat">
              <div className="lab">Countries</div>
              <div className="v">{stats.entities?.countries || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Positions</div>
              <div className="v">{stats.entities?.positions || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Salespersons</div>
              <div className="v">{stats.entities?.salespersons || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Agents</div>
              <div className="v">{stats.entities?.agents || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Employers</div>
              <div className="v">{stats.entities?.employers || 0}</div>
            </div>
            <div className="stat">
              <div className="lab">Lawyers</div>
              <div className="v">{stats.entities?.lawyers || 0}</div>
            </div>
          </div>

          <div className="grid-2">
            {/* Recent Candidates */}
            <div className="card">
              <div className="card-h">
                <h3>Recent candidates</h3>
                <span className="lnk">View all</span>
              </div>
              <div className="card-b">
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Country</th>
                      <th>Agent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="cell-name">
                            <div className="av-sm">{c.initials}</div>
                            <div>
                              <div className="nm">{c.name}</div>
                              <div className="meta">{c.public_code}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="flag">
                            {c.country}
                            <span className="fc">{c.country.slice(0, 2).toUpperCase()}</span>
                          </span>
                        </td>
                        <td>{c.agent}</td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="split-col">
              {/* Source breakdown */}
              <div className="card">
                <div className="card-h">
                  <h3>Candidates by country</h3>
                </div>
                <div className="card-pad">
                  <div className="bars">
                    {topCountries.length > 0 ? topCountries.map((b) => (
                      <div key={b.label} className="barrow">
                        <div className="bl" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '12.5px' }}>{b.label}</span>
                          <span style={{ fontSize: '9px', background: 'var(--ink)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontFamily: 'var(--font-ibm-mono, monospace)' }}>{b.code}</span>
                        </div>
                        <div className="bt">
                          <div className="bf" style={{ width: `${b.pct}%` }} />
                        </div>
                        <div className="bn">{b.n}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '20px 0' }}>No candidate data available.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Pipeline */}
              <div className="card">
                <div className="card-h">
                  <h3>Pipeline health</h3>
                </div>
                <div className="card-b">
                  <div style={{ padding: '18px 22px' }}>
                    <div className="pipe">
                      {[
                        { label: 'Available', icon: '↻', color: 'var(--slate)' },
                        { label: 'Selected', icon: '+', color: 'var(--green)' },
                        { label: 'VISA Processing', icon: '🏢', color: 'var(--gold)' },
                        { label: 'Approved', icon: '✓', color: 'var(--muted)' },
                      ].map((ps, idx) => {
                        const stage = 3;
                        const isDone = idx + 1 < stage;
                        const isCur = idx + 1 === stage;
                        const isLast = idx === 3;
                        return (
                          <div key={ps.label} className={`node ${isDone ? 'done' : isCur ? 'cur' : ''}`}>
                            <div className="stamp" style={{
                              color: isCur || isDone ? ps.color : 'var(--muted)',
                              borderColor: isCur || isDone ? ps.color : 'var(--line)',
                              background: isCur || isDone ? 'transparent' : 'var(--card)'
                            }}>
                              {ps.icon}
                            </div>
                            <div className="lab">{ps.label}</div>
                            {!isLast && <div className="bar" />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--slate)', lineHeight: 1.5 }}>
                      52 of 89 candidates have advanced past selection. 12 fully approved this quarter.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
