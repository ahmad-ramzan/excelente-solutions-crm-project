const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://haynbwrtdymkbfijnqmz.supabase.co',
  'sb_secret_-reHtCKqkcbZ-wQV2WPX2w_Dg-BspEM',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Find approved visa cases where the cascading updates haven't applied
  const { data: approvedVCs } = await supabase
    .from('visa_cases')
    .select('id, candidate_id, selection_id')
    .eq('status', 'approved');

  console.log('Approved visa cases:', approvedVCs?.length || 0);

  for (const vc of (approvedVCs || [])) {
    // Fix candidate status
    const { error: candErr } = await supabase
      .from('candidates')
      .update({ status: 'approved' })
      .eq('id', vc.candidate_id);
    console.log(`  Candidate ${vc.candidate_id.substring(0,8)}: ${candErr ? 'ERROR: ' + candErr.message : 'updated to approved'}`);

    // Fix selection status
    if (vc.selection_id) {
      const { data: sel, error: selErr } = await supabase
        .from('job_offer_selections')
        .update({ status: 'approved' })
        .eq('id', vc.selection_id)
        .select('slot_id')
        .single();
      console.log(`  Selection ${vc.selection_id.substring(0,8)}: ${selErr ? 'ERROR: ' + selErr.message : 'updated to approved'}`);

      // Fix slot status
      if (sel?.slot_id) {
        const { error: slotErr } = await supabase
          .from('job_offer_slots')
          .update({ status: 'filled', filled_at: new Date().toISOString() })
          .eq('id', sel.slot_id);
        console.log(`  Slot ${sel.slot_id.substring(0,8)}: ${slotErr ? 'ERROR: ' + slotErr.message : 'updated to filled'}`);
      }
    }
  }

  console.log('\nDone fixing existing data.');

  // Verify
  const { data: candidates } = await supabase.from('candidates').select('id, first_name, last_name, status')
    .in('id', (approvedVCs || []).map(vc => vc.candidate_id));
  console.log('\n=== VERIFICATION ===');
  candidates?.forEach(c => console.log(`  ${c.first_name} ${c.last_name}: ${c.status}`));
}

main().catch(console.error);
