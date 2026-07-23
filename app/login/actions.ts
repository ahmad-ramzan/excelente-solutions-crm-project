'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const selectedRole = (formData.get('loginRole') as string | null)?.toLowerCase()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error, data: { user } } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !user) {
    return { error: error?.message || 'Failed to authenticate' }
  }

  // Fetch user role and account status
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    console.error('Fetch user role error:', userError)
    return { error: 'Failed to fetch user role.' }
  }

  if (userData.status !== 'active') {
    await supabase.auth.signOut()

    if (userData.status === 'pending') {
      return { error: 'Please confirm your email address before signing in.' }
    }
    if (userData.status === 'suspended') {
      return { error: 'Your account has been suspended. Contact an administrator.' }
    }
    return { error: 'Your account application was not approved.' }
  }

  if (selectedRole && selectedRole !== userData.role) {
    await supabase.auth.signOut()
    return { error: `This account is not registered as ${selectedRole}. Please select the correct role.` }
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${userData.role}`)
}

const PUBLIC_SIGNUP_ROLES = ['employer', 'agent', 'salesperson', 'lawyer']

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const confirmPwd = formData.get('confirmPassword') as string
  const fullName   = formData.get('fullname') as string
  const role       = formData.get('role') as string
  const phone      = formData.get('phone') as string

  // ── Backend field validation ──────────────────────────────────────────────
  if (!email || !password || !fullName || !role) {
    return { error: 'All required fields must be filled in.' }
  }

  if (!phone) {
    return { error: 'Phone / WhatsApp number is required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (password !== confirmPwd) {
    return { error: 'Passwords do not match.' }
  }

  const roleEnum = role.toLowerCase()

  if (!PUBLIC_SIGNUP_ROLES.includes(roleEnum)) {
    return { error: 'Invalid role selected' }
  }

  const metadata: Record<string, string> = {
    full_name: fullName,
    role: roleEnum,
    phone,
  }

  if (roleEnum === 'employer') {
    const companyName = formData.get('companyName') as string
    const country     = formData.get('country') as string
    const outletName  = formData.get('outletName') as string
    const address     = formData.get('address') as string
    const city        = formData.get('city') as string
    const zipCode     = formData.get('zipCode') as string
    const position    = formData.get('position') as string

    if (!companyName || !country || !outletName || !address || !city || !zipCode || !position) {
      return { error: 'All employer fields are required.' }
    }

    metadata.company_name = companyName
    metadata.country_name = country
    metadata.outlet_name  = outletName
    metadata.address      = address
    metadata.city         = city
    metadata.zip_code     = zipCode
    metadata.position     = position
  }

  if (roleEnum === 'agent') {
    const country     = formData.get('country') as string
    const companyName = formData.get('companyName') as string
    const address     = formData.get('address') as string
    const city        = formData.get('city') as string
    const zipCode     = formData.get('zipCode') as string
    const position    = formData.get('position') as string

    if (!companyName || !country || !address || !city || !zipCode || !position) {
      return { error: 'All agent fields are required.' }
    }

    metadata.country_name = country
    metadata.company_name = companyName
    metadata.address      = address
    metadata.city         = city
    metadata.zip_code     = zipCode
    metadata.position     = position
  }

  if (roleEnum === 'lawyer') {
    const country     = formData.get('country') as string
    const companyName = formData.get('companyName') as string
    const address     = formData.get('address') as string
    const city        = formData.get('city') as string
    const zipCode     = formData.get('zipCode') as string
    const position    = formData.get('position') as string

    if (!companyName || !country || !address || !city || !zipCode || !position) {
      return { error: 'All lawyer fields are required.' }
    }

    metadata.country_name = country
    metadata.company_name = companyName
    metadata.address      = address
    metadata.city         = city
    metadata.zip_code     = zipCode
    metadata.position     = position
  }

  if (roleEnum === 'salesperson') {
    const country = formData.get('country') as string
    const address = formData.get('address') as string
    const city    = formData.get('city') as string
    const zipCode = formData.get('zipCode') as string
    const taxId   = formData.get('taxId') as string

    if (!country || !address || !city || !zipCode || !taxId) {
      return { error: 'All salesperson fields are required.' }
    }

    metadata.country_name = country
    metadata.address      = address
    metadata.city         = city
    metadata.zip_code     = zipCode
    metadata.tax_id       = taxId
  }

  // ── Create auth user (email confirmation email sent by Supabase automatically) ──
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cleanSiteUrl = rawSiteUrl.replace(/\/+$/, '').split('/login')[0];

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      // No `next` here on purpose: /auth/callback establishes the session and
      // then sends the user to their own dashboard.
      emailRedirectTo: `${cleanSiteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    
    // Supabase sometimes returns "{}" as a string message for rate limits or undocumented errors.
    let errorMessage = error.message;
    if (typeof errorMessage !== 'string' || errorMessage === '{}' || errorMessage.trim() === '') {
      errorMessage = 'Failed to create account. Please try again.';
    }

    return { error: errorMessage }
  }

  // Auto-activate the user and provision their entity immediately
  if (data.user) {
    const { createAdminClient } = await import('@/utils/supabase/admin');
    const adminClient = createAdminClient();

    // Wait for the trigger to create the profile row
    let profileReady = false;
    for (let i = 0; i < 5; i++) {
       const { data: p } = await adminClient.from('profiles').select('id').eq('id', data.user.id).single();
       if (p) {
           profileReady = true;
           break;
       }
       await new Promise(r => setTimeout(r, 500));
    }

    if (profileReady) {
       await adminClient.from('profiles').update({ status: 'active' }).eq('id', data.user.id);
       const { autoProvisionEntityForActiveUser } = await import('@/app/actions/admin-actions');
       await autoProvisionEntityForActiveUser(data.user.id);
    }
  }

  revalidatePath('/', 'layout')

  // If email confirmation is required, signUp() won't have established a session yet —
  // fall back to the login page in that case instead of bouncing into a dashboard with no auth.
  if (data.session) {
    redirect(`/dashboard/${roleEnum}`)
  }

  redirect('/login?registered=true')
}
