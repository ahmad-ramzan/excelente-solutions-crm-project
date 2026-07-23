import AppSidebar from '../../components/AppSidebar';
import AppTopbar from '../../components/AppTopbar';
import StatusBadge from '../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';
import { getDashboardStats } from '@/app/lib/queries';
import ExportButton from './ExportButton';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Independent of each other — fetch concurrently instead of one at a time.
  // Candidates can have several destination countries (candidate_countries is
  // many-to-many) — `candidates.country_id` was dropped when that model landed,
  // so both the country breakdown and each candidate's country come from here.
  const [stats, { data: dbCandidates }, { data: countryData }] = await Promise.all([
    getDashboardStats(supabase, 'admin'),
    supabase
      .from('candidate_public_view')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false }),
    supabase
      .from('candidate_countries')
      .select('candidate_id, country_id, countries(name, code)'),
  ]);

  const candidateCountryMap: Record<string, { names: string[]; codes: string[] }> = {};
  countryData?.forEach((row: any) => {
    if (!row.countries) return;
    if (!candidateCountryMap[row.candidate_id]) candidateCountryMap[row.candidate_id] = { names: [], codes: [] };
    candidateCountryMap[row.candidate_id].names.push(row.countries.name);
    candidateCountryMap[row.candidate_id].codes.push(row.countries.code);
  });

  const candidates = (dbCandidates || []).map((c: any) => {
    const assignedCountries = candidateCountryMap[c.id]?.names || [];
    const assignedCountryCodes = candidateCountryMap[c.id]?.codes || [];
    return {
      id: c.id,
      public_code: c.public_code,
      initials: `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase(),
      name: `${c.first_name} ${c.last_name}`,
      nationality: c.nationality,
      country: c.open_to_all_countries ? 'Any Country' : (assignedCountries.join(', ') || 'Unassigned'),
      countryCode: c.open_to_all_countries ? 'ANY' : (assignedCountryCodes[0] || '--'),
      trade: c.positions?.[0] || 'N/A',
      agent_id: c.agent_id, // we should probably join profiles for agent name, let's just show 'Agent' for now if not joined
      agent: '',
      status: c.status
    };
  });

  // Fetch Agent Names for candidates
  const agentIds = Array.from(new Set(candidates.map(c => c.agent_id).filter(Boolean)));
  const agentMap: Record<string, string> = {};
  if (agentIds.length > 0) {
    const { data: agents } = await supabase.from('profiles').select('id, full_name').in('id', agentIds);
    agents?.forEach(a => agentMap[a.id] = a.full_name);
  }

  // Assign agent name
  candidates.forEach(c => c.agent = agentMap[c.agent_id] || 'N/A');

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
        <AppTopbar section="Dashboard" role="admin" />
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
                            <span className="fc">{c.countryCode}</span>
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

              {/* Health Pipeline — driven by real candidate status counts */}
              <div className="card">
                <div className="card-h">
                  <h3>Pipeline health</h3>
                </div>
                <div className="card-b">
                  <div style={{ padding: '18px 22px' }}>
                    <div className="pipe">
                      {[
                        { label: 'Available', icon: '↻', color: 'var(--slate)', count: stats.candidates?.available || 0 },
                        { label: 'Selected', icon: '+', color: 'var(--green)', count: stats.candidates?.selected || 0 },
                        { label: 'VISA Processing', icon: '🏢', color: 'var(--gold)', count: stats.candidates?.visa_processing || 0 },
                        { label: 'Approved', icon: '✓', color: 'var(--muted)', count: stats.candidates?.approved || 0 },
                      ].map((ps, idx, stages) => {
                        // "Reached" a stage if any candidate is at it or further along the pipeline.
                        const isReached = stages.slice(idx).some(s => s.count > 0);
                        const isCur = isReached && !stages.slice(idx + 1).some(s => s.count > 0);
                        const isLast = idx === stages.length - 1;
                        return (
                          <div key={ps.label} className={`node ${isReached && !isCur ? 'done' : isCur ? 'cur' : ''}`}>
                            <div className="stamp" style={{
                              color: isReached ? ps.color : 'var(--muted)',
                              borderColor: isReached ? ps.color : 'var(--line)',
                              background: isReached ? 'transparent' : 'var(--card)'
                            }}>
                              {ps.icon}
                            </div>
                            <div className="lab">{ps.label}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>{ps.count}</div>
                            {!isLast && <div className="bar" />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--slate)', lineHeight: 1.5 }}>
                      {(stats.candidates?.selected || 0) + (stats.candidates?.visa_processing || 0) + (stats.candidates?.approved || 0)} of {stats.total_candidates || 0} candidates have advanced past selection. {stats.candidates?.approved || 0} fully approved.
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
