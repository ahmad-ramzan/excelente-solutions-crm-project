import { SupabaseClient } from '@supabase/supabase-js';

// Aggregate stats by role
export async function getDashboardStats(supabase: SupabaseClient, role: string, entityId?: string) {
  const stats: any = {};
  
  if (role === 'admin') {
    // All independent of each other — fetch concurrently instead of one wave at a time.
    const [
      { data: candStats },
      { count: cCountries }, { count: cPositions }, { count: cSales }, { count: cAgents }, { count: cEmployers }, { count: cLawyers },
    ] = await Promise.all([
      supabase.from('candidates').select('status'),
      supabase.from('countries').select('*', { count: 'exact', head: true }),
      supabase.from('positions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'salesperson'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    ]);

    // Total candidates by status
    const candCounts = { available: 0, selected: 0, visa_processing: 0, approved: 0 };
    candStats?.forEach(c => {
      if (candCounts[c.status as keyof typeof candCounts] !== undefined) {
        candCounts[c.status as keyof typeof candCounts]++;
      }
    });
    stats.candidates = candCounts;
    stats.total_candidates = candStats?.length || 0;
    
    stats.entities = {
      countries: cCountries || 0,
      positions: cPositions || 0,
      salespersons: cSales || 0,
      agents: cAgents || 0,
      employers: cEmployers || 0,
      lawyers: cLawyers || 0,
    };
  } else if (role === 'agent') {
    // Need user ID for agent (assuming it's passed as 3rd arg)
    const userId = entityId;
    if (userId) {
      const { data: candStats } = await supabase.from('candidates').select('status').eq('agent_id', userId);
      const candCounts = { available: 0, selected: 0, visa_processing: 0, approved: 0 };
      candStats?.forEach(c => {
        if (candCounts[c.status as keyof typeof candCounts] !== undefined) {
          candCounts[c.status as keyof typeof candCounts]++;
        }
      });
      stats.candidates = candCounts;
      stats.total_candidates = candStats?.length || 0;
    }
  } else if (role === 'employer') {
    const employerId = entityId;
    if (employerId) {
      // Get job offers stats
      const { data: jobOffers } = await supabase.from('job_offers').select('id, status, staff_needed').eq('employer_id', employerId);
      stats.total_offers = jobOffers?.length || 0;
      stats.open_offers = jobOffers?.filter(o => o.status === 'open').length || 0;
      stats.total_slots = jobOffers?.reduce((acc, curr) => acc + (curr.staff_needed || 0), 0) || 0;
      
      if (jobOffers && jobOffers.length > 0) {
        const offerIds = jobOffers.map(o => o.id);
        const { data: selections } = await supabase.from('job_offer_selections').select('id, status').in('job_offer_id', offerIds);
        stats.total_selections = selections?.length || 0;
        stats.active_selections = selections?.filter(s => ['selected', 'visa_processing'].includes(s.status)).length || 0;
      } else {
        stats.total_selections = 0;
        stats.active_selections = 0;
      }
    }
  }

  return stats;
}

export async function getAgentCandidates(supabase: SupabaseClient, agentId: string) {
  const { data } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getEmployerCandidates(supabase: SupabaseClient, countryId: string) {
  // Employers only see available candidates for their country. Destinations
  // live in candidate_countries (many-to-many) — candidate_public_view has no
  // single country_id column to filter on directly.
  const { data: available } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  const ids = (available || []).map(c => c.id);
  if (ids.length === 0) return [];

  const { data: candidateCountries } = await supabase
    .from('candidate_countries')
    .select('candidate_id')
    .eq('country_id', countryId)
    .in('candidate_id', ids);

  const eligibleIds = new Set((candidateCountries || []).map(cc => cc.candidate_id));
  return (available || []).filter(c => c.open_to_all_countries || eligibleIds.has(c.id));
}

// Positions currently being hired for, aggregated from employers' open job offers —
// used to steer candidates toward real, live vacancies instead of the full admin catalog.
export async function getOpenVacancyPositions(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('job_offers')
    .select('position_id, staff_needed, positions(name), employers(name), countries(name)')
    .in('status', ['draft', 'open']);

  const byPosition = new Map<string, { id: string; name: string; openRoles: number; employers: Set<string>; countries: Set<string> }>();

  (data || []).forEach((o: any) => {
    if (!o.position_id) return;
    const position = Array.isArray(o.positions) ? o.positions[0] : o.positions;
    if (!position?.name) return;
    const employer = Array.isArray(o.employers) ? o.employers[0] : o.employers;
    const country = Array.isArray(o.countries) ? o.countries[0] : o.countries;

    if (!byPosition.has(o.position_id)) {
      byPosition.set(o.position_id, { id: o.position_id, name: position.name, openRoles: 0, employers: new Set(), countries: new Set() });
    }
    const entry = byPosition.get(o.position_id)!;
    entry.openRoles += o.staff_needed || 0;
    if (employer?.name) entry.employers.add(employer.name);
    if (country?.name) entry.countries.add(country.name);
  });

  return Array.from(byPosition.values())
    .map(e => ({
      id: e.id,
      name: e.name,
      openRoles: e.openRoles,
      employers: Array.from(e.employers),
      countries: Array.from(e.countries),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// The "contracts" storage bucket is private, so viewing a job offer's uploaded
// Contract with Candidate requires a signed URL generated with the service-role
// client — regular RLS-scoped clients have no read access to it at all.
export async function getContractSignedUrls(offerIds: string[]): Promise<Record<string, string>> {
  if (offerIds.length === 0) return {};

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminClient = createAdminClient();

  const { data: offers } = await adminClient
    .from('job_offers')
    .select('id, contract_file_path')
    .in('id', offerIds);

  const result: Record<string, string> = {};

  await Promise.all((offers || []).map(async (o) => {
    if (!o.contract_file_path) return;
    const { data } = await adminClient.storage.from('contracts').createSignedUrl(o.contract_file_path, 3600);
    if (data?.signedUrl) result[o.id] = data.signedUrl;
  }));

  return result;
}

// Same story for "candidate-documents" — private bucket, no client-side RLS read
// access, so every photo/CV/document link needs a signed URL generated here.
// Keyed by storage path (not document id) so callers can look up by file_path.
export async function getCandidateDocumentSignedUrls(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const uniquePaths = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (uniquePaths.length === 0) return {};

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const adminClient = createAdminClient();

  const result: Record<string, string> = {};

  await Promise.all(uniquePaths.map(async (path) => {
    const { data } = await adminClient.storage.from('candidate-documents').createSignedUrl(path, 3600);
    if (data?.signedUrl) result[path] = data.signedUrl;
  }));

  return result;
}
