import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { dashboardPathFor } from '@/utils/auth-redirect'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // An explicit ?next= always wins.
      if (next) return NextResponse.redirect(new URL(next, request.url))

      // The code exchange already established a session, so send the user
      // straight to their dashboard instead of back to the login screen.
      return NextResponse.redirect(new URL(await dashboardPathFor(supabase), request.url))
    }
  }

  const redirectTo = new URL('/login', request.url)
  redirectTo.searchParams.set('error', 'confirmation_failed')
  return NextResponse.redirect(redirectTo)
}
