const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://haynbwrtdymkbfijnqmz.supabase.co',
  'sb_secret_-reHtCKqkcbZ-wQV2WPX2w_Dg-BspEM',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Check visa cases with approved status
  const { data: approvedVisa } = await supabase
    .from('visa_cases')
    .select('id, status, candidate_id, selection_id')
    .eq('status', 'approved');

  console.log('=== APPROVED VISA CASES ===');
  console.log('Count:', approvedVisa?.length || 0);
  approvedVisa?.forEach(vc => {
    console.log(`  Visa case ${vc.id.substring(0, 8)}: candidate=${vc.candidate_id.substring(0, 8)}, selection=${vc.selection_id?.substring(0, 8) || 'NULL'}`);
  });

  // Check candidate statuses
  if (approvedVisa && approvedVisa.length > 0) {
    const candidateIds = approvedVisa.map(vc => vc.candidate_id);
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, first_name, last_name, status')
      .in('id', candidateIds);

    console.log('\n=== CANDIDATE STATUSES (for approved visa cases) ===');
    candidates?.forEach(c => {
      console.log(`  ${c.first_name} ${c.last_name} (${c.id.substring(0, 8)}): status = ${c.status}`);
    });
  }

  // Check selection statuses
  if (approvedVisa && approvedVisa.length > 0) {
    const selectionIds = approvedVisa.map(vc => vc.selection_id).filter(Boolean);
    if (selectionIds.length > 0) {
      const { data: selections } = await supabase
        .from('job_offer_selections')
        .select('id, status, candidate_id')
        .in('id', selectionIds);

      console.log('\n=== SELECTION STATUSES (for approved visa cases) ===');
      selections?.forEach(s => {
        console.log(`  Selection ${s.id.substring(0, 8)}: candidate=${s.candidate_id.substring(0, 8)}, status = ${s.status}`);
      });
    }
  }

  // Check slot statuses
  if (approvedVisa && approvedVisa.length > 0) {
    const candidateIds = approvedVisa.map(vc => vc.candidate_id);
    const { data: slots } = await supabase
      .from('job_offer_slots')
      .select('id, candidate_id, status')
      .in('candidate_id', candidateIds);

    console.log('\n=== SLOT STATUSES (for approved candidates) ===');
    slots?.forEach(s => {
      console.log(`  Slot ${s.id.substring(0, 8)}: candidate=${s.candidate_id?.substring(0, 8)}, status = ${s.status}`);
    });
  }

  // Also check ALL candidates and their statuses
  const { data: allCandidates } = await supabase
    .from('candidates')
    .select('id, first_name, last_name, status');

  console.log('\n=== ALL CANDIDATES ===');
  allCandidates?.forEach(c => {
    console.log(`  ${c.first_name} ${c.last_name}: status = ${c.status}`);
  });

  // Also check ALL selections
  const { data: allSelections } = await supabase
    .from('job_offer_selections')
    .select('id, status, candidate_id');

  console.log('\n=== ALL SELECTIONS ===');
  allSelections?.forEach(s => {
    console.log(`  Selection ${s.id.substring(0, 8)}: candidate=${s.candidate_id.substring(0, 8)}, status = ${s.status}`);
  });
}

main().catch(console.error);
