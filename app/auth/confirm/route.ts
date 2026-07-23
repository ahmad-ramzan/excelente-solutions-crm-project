import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { dashboardPathFor } from '@/utils/auth-redirect'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // An explicit ?next= always wins.
      if (next) return NextResponse.redirect(new URL(next, request.url))

      // verifyOtp already established a session, so send the user straight to
      // their dashboard instead of bouncing them back to the login screen.
      return NextResponse.redirect(new URL(await dashboardPathFor(supabase), request.url))
    }
  }

  const redirectTo = new URL('/login', request.url)
  redirectTo.searchParams.set('error', 'confirmation_failed')
  return NextResponse.redirect(redirectTo)
}
