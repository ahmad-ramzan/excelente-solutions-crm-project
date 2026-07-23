import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import StatusBadge from '../../../components/StatusBadge';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<{ status?: string, country?: string, q?: string }> }) {
  const supabase = await createClient();
  const params = await searchParams;

  // `candidate_public_view` has no `country_name` column — a candidate can have
  // several destination countries (candidate_countries is many-to-many), so
  // that's filtered/joined separately below instead of on the view directly.
  let query = supabase.from('candidate_public_view').select('*').order('created_at', { ascending: false });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params.q) {
    const q = params.q.trim();
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,public_code.ilike.%${q}%`);
  }

  const { data: allCandidates } = await query;

  const { data: countries } = await supabase.from('countries').select('name');

  const candidateIds = (allCandidates || []).map((c: any) => c.id);
  const candidateCountryMap: Record<string, { names: string[]; codes: string[] }> = {};
  if (candidateIds.length > 0) {
    const { data: candidateCountries } = await supabase
      .from('candidate_countries')
      .select('candidate_id, countries(name, code)')
      .in('candidate_id', candidateIds);

    (candidateCountries || []).forEach((row: any) => {
      const country = Array.isArray(row.countries) ? row.countries[0] : row.countries;
      if (!country) return;
      if (!candidateCountryMap[row.candidate_id]) candidateCountryMap[row.candidate_id] = { names: [], codes: [] };
      candidateCountryMap[row.candidate_id].names.push(country.name);
      candidateCountryMap[row.candidate_id].codes.push(country.code);
    });
  }

  const countryFilter = params.country && params.country !== 'all' ? params.country : null;
  const dbCandidates = countryFilter
    ? (allCandidates || []).filter((c: any) => (candidateCountryMap[c.id]?.names || []).includes(countryFilter))
    : (allCandidates || []);

  // Try to get employer name via selections for selected/visa_processing/approved candidates
  const selectedCandidateIds = dbCandidates.filter((c: any) => c.status !== 'available').map((c: any) => c.id);
  const employerMap: Record<string, string> = {};
  if (selectedCandidateIds.length > 0) {
    const { data: selections } = await supabase
      .from('job_offer_selections')
      .select('candidate_id, employers(name)')
      .in('candidate_id', selectedCandidateIds);

    selections?.forEach((s: any) => {
      employerMap[s.candidate_id] = s.employers?.name || 'Unknown';
    });
  }

  const candidates = dbCandidates.map((c: any) => {
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
      skills: c.positions?.slice(1) || [],
      employer: employerMap[c.id] || 'Not Assigned',
      status: c.status
    };
  });

  const currentStatus = params.status || 'all';
  const currentCountry = params.country || 'all';

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Candidates" role="admin" searchPlaceholder="Search candidates…" searchValue={params.q} />
        <div className="wrap">
          <div className="page-head">
            <div>
              <h1>Candidates</h1>
              <p className="ph-sub">{candidates.length} candidates registered.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none', gap: '20px' }}>
              {[
                { label: 'All', val: 'all' },
                { label: 'Available', val: 'available' },
                { label: 'Selected', val: 'selected' },
                { label: 'Visa processing', val: 'visa_processing' },
                { label: 'Approved', val: 'approved' }
              ].map(t => (
                <Link key={t.val} href={`/dashboard/admin/candidates?status=${t.val}&country=${currentCountry}`}>
                  <div className={`tab ${currentStatus === t.val ? 'on' : ''}`} style={currentStatus === t.val ? { color: 'var(--brand)', borderBottomColor: 'var(--brand)', padding: '0 0 10px 0' } : { padding: '0 0 10px 0' }}>{t.label}</div>
                </Link>
              ))}
            </div>

            {/* In a real app we'd use a client component for the select to update searchParams on change */}
            <select 
              className="input" 
              style={{ width: 'auto', minWidth: '160px', padding: '8px 12px', fontSize: '13px' }}
              defaultValue={currentCountry}
            >
              <option value="all">All countries</option>
              {countries?.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
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
                  {candidates.map((c) => (
                    <tr key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                      <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
                        <div className="cell-name">
                          <div className="av-sm" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                            {c.initials}
                          </div>
                          <div>
                            <div className="nm" style={{ marginBottom: '2px' }}>{c.name}</div>
                            <div className="meta" style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--muted)' }}>{c.public_code}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.country}</span> <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 6px', fontSize: '10px', marginLeft: '4px', border: 'none' }}>{c.countryCode}</span>
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <span className="chip">{c.trade}</span>
                        {c.skills && c.skills[0] && (
                          <span className="chip">{c.skills[0]}</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                        {c.employer}
                      </td>
                      <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                        <Link href={`/dashboard/admin/candidates/${c.public_code}`}>
                          <button className="ico-btn" style={{ fontSize: '14px', border: '1px solid var(--line-2)', borderRadius: '6px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'transparent', cursor: 'pointer' }}>
                            →
                          </button>
                        </Link>
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
