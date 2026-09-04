export async function canManageCandidate(supabase: any, userId: string, candidateId: string) {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (profile?.role === 'admin') return true;

  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', candidateId)
    .eq('agent_id', userId)
    .single();

  return !!candidate;
}
