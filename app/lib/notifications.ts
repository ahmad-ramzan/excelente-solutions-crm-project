import { sendNotificationEmail } from '@/app/lib/email';
import { buildNotificationLink } from '@/app/lib/notification-links';

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

// Candidates and visa cases are deep-linkable by public_code — resolve it so
// the notification/email can point straight at the record instead of a list.
async function resolvePublicCode(adminClient: any, entityTable?: string, entityId?: string): Promise<string | null> {
  if (!entityId || (entityTable !== 'candidates' && entityTable !== 'visa_cases')) return null;

  const { data } = await adminClient.from(entityTable).select('public_code').eq('id', entityId).maybeSingle();
  return data?.public_code ?? null;
}

export async function notifyUsers(adminClient: any, recipientIds: (string | null | undefined)[], options: NotifyOptions) {
  const ids = Array.from(new Set(recipientIds.filter((id): id is string => !!id && id !== options.actorId)));
  if (ids.length === 0) return;

  const [{ data: recipients }, publicCode] = await Promise.all([
    adminClient.from('profiles').select('id, role, email, full_name').in('id', ids),
    resolvePublicCode(adminClient, options.entityTable, options.entityId),
  ]);

  const byId: Record<string, { role: string; email: string | null }> = {};
  (recipients || []).forEach((r: any) => {
    byId[r.id] = { role: r.role, email: r.email };
  });

  const rows = ids.map((recipient_id) => ({
    recipient_id,
    actor_id: options.actorId,
    type: options.type,
    title: options.title,
    body: options.body ?? null,
    entity_table: options.entityTable ?? null,
    entity_id: options.entityId ?? null,
    link_url: buildNotificationLink(byId[recipient_id]?.role || 'admin', options.entityTable, publicCode),
  }));

  const { error } = await adminClient.from('notifications').insert(rows);
  if (error) console.error('Notification insert error:', error);

  await Promise.all(
    ids.map(async (recipientId) => {
      const recipient = byId[recipientId];
      if (!recipient?.email) return;

      await sendNotificationEmail({
        to: recipient.email,
        subject: options.title,
        heading: options.title,
        body: options.body || options.title,
        linkUrl: buildNotificationLink(recipient.role, options.entityTable, publicCode),
      });
    })
  );
}

// For events whose in-app notification is created by a database trigger
// (candidate selection) — the row already exists, this just sends the email.
export async function emailRecipients(adminClient: any, recipientIds: (string | null | undefined)[], options: NotifyOptions) {
  const ids = Array.from(new Set(recipientIds.filter((id): id is string => !!id && id !== options.actorId)));
  if (ids.length === 0) return;

  const [{ data: recipients }, publicCode] = await Promise.all([
    adminClient.from('profiles').select('id, role, email').in('id', ids),
    resolvePublicCode(adminClient, options.entityTable, options.entityId),
  ]);

  await Promise.all(
    (recipients || [])
      .filter((r: any) => r.email)
      .map((r: any) =>
        sendNotificationEmail({
          to: r.email,
          subject: options.title,
          heading: options.title,
          body: options.body || options.title,
          linkUrl: buildNotificationLink(r.role, options.entityTable, publicCode),
        })
      )
  );
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
