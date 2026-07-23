import type { SupabaseClient } from '@supabase/supabase-js'

const VALID_ROLES = ['admin', 'salesperson', 'agent', 'employer', 'lawyer']

/**
 * Where to send a user whose session was just established by an email
 * confirmation link.
 *
 * Confirming the email already signs the user in (and the
 * `handle_email_confirmed` trigger flips their profile to `active`), so they
 * should land on their dashboard rather than being asked to log in again.
 * If the profile isn't usable yet we fall back to the login page, which shows
 * the "email confirmed" banner.
 */
export async function dashboardPathFor(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return '/login?confirmed=true'

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'active' && VALID_ROLES.includes(profile.role)) {
    return `/dashboard/${profile.role}`
  }

  return '/login?confirmed=true'
}
