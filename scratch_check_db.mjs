import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://haynbwrtdymkbfijnqmz.supabase.co'
const supabaseKey = 'sb_publishable_ezwuUnjgIc-jiMq-vUNT6Q_qoUHJ_U3'
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5)
  console.log('Profiles:', profiles, pError)
  const { data: employers, error: eError } = await supabase.from('employers').select('*').limit(5)
  console.log('Employers:', employers, eError)
  const { data: employerUsers, error: euError } = await supabase.from('employer_users').select('*').limit(5)
  console.log('Employer Users:', employerUsers, euError)
}

check()
