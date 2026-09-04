export async function getUserRole(supabase: any, userId: string) {
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return profile?.role as string | undefined;
}

export async function isOwningAgent(supabase: any, userId: string, candidateId: string) {
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('id', candidateId)
    .eq('agent_id', userId)
    .single();

  return !!candidate;
}

export async function canManageCandidate(supabase: any, userId: string, candidateId: string) {
  const role = await getUserRole(supabase, userId);
  if (role === 'admin') return true;

  return isOwningAgent(supabase, userId, candidateId);
}
