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
    // Check what the actual error is, sometimes trigger might fail, or RLS might block
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

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullname') as string
  const role = formData.get('role') as string

  if (!email || !password || !fullName || !role) {
    return { error: 'All fields are required' }
  }

  const roleEnum = role.toLowerCase()

  if (!PUBLIC_SIGNUP_ROLES.includes(roleEnum)) {
    return { error: 'Invalid role selected' }
  }

  const metadata: Record<string, string> = {
    full_name: fullName,
    role: roleEnum,
  }

  if (roleEnum === 'employer') {
    const companyName = formData.get('companyName') as string
    const country = formData.get('country') as string
    const outletName = formData.get('outletName') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const zipCode = formData.get('zipCode') as string
    const position = formData.get('position') as string

    if (!companyName || !country) {
      return { error: 'Company name and country are required for employer accounts' }
    }

    metadata.company_name = companyName
    metadata.country_name = country
    if (outletName) metadata.outlet_name = outletName
    if (address) metadata.address = address
    if (city) metadata.city = city
    if (zipCode) metadata.zip_code = zipCode
    if (position) metadata.position = position
  }

  if (roleEnum === 'lawyer' || roleEnum === 'agent') {
    const country = formData.get('country') as string
    const companyName = formData.get('companyName') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const zipCode = formData.get('zipCode') as string
    const position = formData.get('position') as string

    if (!country) {
      return { error: `Country is required for ${roleEnum} accounts` }
    }

    metadata.country_name = country
    if (companyName) metadata.company_name = companyName
    if (address) metadata.address = address
    if (city) metadata.city = city
    if (zipCode) metadata.zip_code = zipCode
    if (position) metadata.position = position
  }

  if (roleEnum === 'salesperson') {
    const country = formData.get('country') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const zipCode = formData.get('zipCode') as string
    const taxId = formData.get('taxId') as string

    if (!country) {
      return { error: 'Country is required for salesperson accounts' }
    }

    metadata.country_name = country
    if (address) metadata.address = address
    if (city) metadata.city = city
    if (zipCode) metadata.zip_code = zipCode
    if (taxId) metadata.tax_id = taxId
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message || 'Failed to create account. Please try again.' }
  }

  revalidatePath('/', 'layout')

  // If email confirmation is required, signUp() won't have established a session yet —
  // fall back to the login page in that case instead of bouncing into a dashboard with no auth.
  if (data.session) {
    redirect(`/dashboard/${roleEnum}`)
  }

  redirect('/login?registered=true')
}
