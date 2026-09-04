export type NotificationType =
  | 'candidate_selected'
  | 'document_requested'
  | 'visa_approved'
  | 'visa_updated'
  | 'job_offer_created'
  | 'order_milestone'
  | 'system';

interface NotifyOptions {
  actorId: string;
  type: NotificationType;
  title: string;
  body?: string;
  entityTable?: string;
  entityId?: string;
}

// Recipient lookups need to see across roles (e.g. an agent notifying admins,
// or a lawyer notifying an employer's users), which regular RLS won't allow —
// callers must pass the admin (service-role) client, not the session client.

export async function notifyUsers(adminClient: any, recipientIds: (string | null | undefined)[], options: NotifyOptions) {
  const ids = Array.from(new Set(recipientIds.filter((id): id is string => !!id && id !== options.actorId)));
  if (ids.length === 0) return;

  const rows = ids.map((recipient_id) => ({
    recipient_id,
    actor_id: options.actorId,
    type: options.type,
    title: options.title,
    body: options.body ?? null,
    entity_table: options.entityTable ?? null,
    entity_id: options.entityId ?? null,
  }));

  const { error } = await adminClient.from('notifications').insert(rows);
  if (error) console.error('Notification insert error:', error);
}

export async function getActiveAdminIds(adminClient: any): Promise<string[]> {
  const { data } = await adminClient.from('profiles').select('id').eq('role', 'admin').eq('status', 'active');
  return (data || []).map((p: any) => p.id);
}

export async function notifyAdmins(adminClient: any, options: NotifyOptions) {
  const adminIds = await getActiveAdminIds(adminClient);
  await notifyUsers(adminClient, adminIds, options);
}

export async function getEmployerUserIds(adminClient: any, employerId: string): Promise<string[]> {
  const { data } = await adminClient.from('employer_users').select('profile_id').eq('employer_id', employerId);
  return (data || []).map((r: any) => r.profile_id);
}

// The agent/lawyer assigned to a candidate's open visa case, if any.
export async function getCaseAssignees(adminClient: any, candidateId: string): Promise<{ agentId: string | null; lawyerId: string | null }> {
  const { data } = await adminClient
    .from('visa_cases')
    .select('agent_id, lawyer_id')
    .eq('candidate_id', candidateId)
    .maybeSingle();

  return { agentId: data?.agent_id ?? null, lawyerId: data?.lawyer_id ?? null };
}
