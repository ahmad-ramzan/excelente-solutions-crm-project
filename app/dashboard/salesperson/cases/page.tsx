import AppSidebar from '../../../components/AppSidebar';
import AppTopbar from '../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';
import TravelCoordinationCard from '@/app/components/TravelCoordinationCard';

export default async function SalespersonCasesPage({ searchParams }: { searchParams: Promise<{ case?: string }> }) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // A case belongs to this salesperson either because the job offer itself is
  // assigned to them directly, or because it belongs to one of their employers
  // (which may predate the offer being explicitly re-assigned). Resolve both
  // via the admin client instead of relying on RLS matching this exact shape.
  const { data: dbEmployers } = await adminClient
    .from('employers')
    .select('id')
    .eq('assigned_salesperson_id', user.id);
  const employerIds = (dbEmployers || []).map(e => e.id);

  const orFilter = employerIds.length > 0
    ? `assigned_salesperson_id.eq.${user.id},employer_id.in.(${employerIds.join(',')})`
    : `assigned_salesperson_id.eq.${user.id}`;
  const { data: dbOffers } = await adminClient
    .from('job_offers')
    .select('id')
    .or(orFilter);
  const offerIds = (dbOffers || []).map(o => o.id);

  let casesData: any[] = [];
  if (offerIds.length > 0) {
    const { data } = await adminClient
      .from('visa_cases')
      .select(`
        id, public_code, status,
        candidates ( first_name, last_name ),
        employers ( name ),
        job_offers ( countries ( name, code ) )
      `)
      .eq('status', 'approved')
      .in('job_offer_id', offerIds)
      .order('approved_at', { ascending: false });
    casesData = data || [];
  }

  const cases = casesData.map((c: any) => ({
    id: c.id,
    public_code: c.public_code,
    candidateName: `${c.candidates?.first_name} ${c.candidates?.last_name}`,
    employer: c.employers?.name || 'Unknown',
    country: c.job_offers?.countries?.name || 'Unknown',
    countryCode: c.job_offers?.countries?.code || 'XX',
  }));

  const selectedCode = params.case;
  const selected = cases.find(c => c.public_code === selectedCode);

  let travel = null;
  if (selected) {
    const { data } = await adminClient.from('visa_case_travel').select('*').eq('visa_case_id', selected.id).maybeSingle();
    travel = data;
  }

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Approved cases" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Approved cases</h1>
              <p className="ph-sub">{cases.length} approved visa cases ready for travel coordination.</p>
            </div>
          </div>

          <div className={selected ? 'content-with-sidebar' : ''} style={!selected ? { display: 'block' } : undefined}>
            <div className="card" style={{ border: 'none', background: 'transparent' }}>
              <div className="card-b" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CASE</th>
                      <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>CANDIDATE</th>
                      <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>EMPLOYER</th>
                      <th style={{ padding: '0 22px 12px', fontSize: '10.5px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em', borderBottom: '1px solid var(--line-2)' }}>COUNTRY</th>
                      <th style={{ padding: '0 22px 12px', borderBottom: '1px solid var(--line-2)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c.id} style={{ background: c.public_code === selectedCode ? 'var(--brand-soft)' : 'var(--card)', border: '1px solid var(--line)', borderRadius: '13px' }}>
                        <td style={{ padding: '16px 22px', borderTopLeftRadius: '13px', borderBottomLeftRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderLeft: '1px solid var(--line)', color: 'var(--slate)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {c.public_code}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', fontWeight: 600, color: 'var(--ink)' }}>
                          {c.candidateName}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', color: 'var(--slate)' }}>
                          {c.employer}
                        </td>
                        <td style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                          {c.country} <span className="chip" style={{ background: 'var(--ink)', color: '#fff', padding: '2px 5px', fontSize: '10px', border: 'none', marginLeft: '4px' }}>{c.countryCode}</span>
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right', borderTopRightRadius: '13px', borderBottomRightRadius: '13px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
                          <Link href={`/dashboard/salesperson/cases?case=${c.public_code}`}>
                            <button className="btn" style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                              Coordinate
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {cases.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
                          No approved cases yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selected && (
              <TravelCoordinationCard visaCaseId={selected.id} travel={travel} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
