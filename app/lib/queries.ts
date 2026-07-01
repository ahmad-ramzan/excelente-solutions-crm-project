import { SupabaseClient } from '@supabase/supabase-js';

// Aggregate stats by role
export async function getDashboardStats(supabase: SupabaseClient, role: string) {
  const stats: any = {};
  
  if (role === 'admin') {
    // Total candidates by status
    const { data: candStats } = await supabase.from('candidates').select('status');
    const candCounts = { available: 0, selected: 0, visa_processing: 0, approved: 0 };
    candStats?.forEach(c => {
      if (candCounts[c.status as keyof typeof candCounts] !== undefined) {
        candCounts[c.status as keyof typeof candCounts]++;
      }
    });
    stats.candidates = candCounts;
    stats.total_candidates = candStats?.length || 0;

    // Entity counts
    const [{ count: cCountries }, { count: cPositions }, { count: cSales }, { count: cAgents }, { count: cEmployers }, { count: cLawyers }] = await Promise.all([
      supabase.from('countries').select('*', { count: 'exact', head: true }),
      supabase.from('positions').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'salesperson'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agent'),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'lawyer'),
    ]);
    
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
    const userId = arguments[2];
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
    const employerId = arguments[2];
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
  // Employers only see available candidates for their country
  const { data } = await supabase
    .from('candidate_public_view')
    .select('*')
    .eq('country_id', countryId)
    .eq('status', 'available')
    .order('created_at', { ascending: false });
  return data || [];
}
