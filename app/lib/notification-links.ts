export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.excelente.my';
  return raw.replace(/\/+$/, '');
}

// Where each role should land for a given entity. Candidates and visa cases
// are deep-linked by their public_code (resolved by the caller); everything
// else points at the role's list page for that entity, which is always valid.
function listPath(role: string, entityTable?: string | null): string {
  switch (entityTable) {
    case 'candidates':
      if (role === 'agent') return '/dashboard/agent/candidates';
      if (role === 'admin') return '/dashboard/admin/candidates';
      if (role === 'employer') return '/dashboard/employer/candidates';
      if (role === 'lawyer') return '/dashboard/lawyer/cases';
      if (role === 'salesperson') return '/dashboard/salesperson/cases';
      break;
    case 'visa_cases':
      if (role === 'lawyer') return '/dashboard/lawyer/cases';
      if (role === 'admin') return '/dashboard/admin/visas';
      if (role === 'agent') return '/dashboard/agent/candidates';
      if (role === 'employer') return '/dashboard/employer/selections';
      if (role === 'salesperson') return '/dashboard/salesperson/cases';
      break;
    case 'job_offers':
      if (role === 'employer') return '/dashboard/employer/offers';
      if (role === 'admin') return '/dashboard/admin/offers';
      if (role === 'salesperson') return '/dashboard/salesperson/orders';
      if (role === 'agent') return '/dashboard/agent/vacancies';
      break;
    case 'employers':
      if (role === 'admin') return '/dashboard/admin/employers';
      if (role === 'salesperson') return '/dashboard/salesperson/employers';
      break;
  }
  return `/dashboard/${role}`;
}

export function buildNotificationLink(
  role: string,
  entityTable?: string | null,
  publicCode?: string | null,
): string {
  const base = siteUrl();

  if (publicCode) {
    if (entityTable === 'candidates') {
      if (role === 'agent') return `${base}/dashboard/agent/candidates/${publicCode}`;
      if (role === 'admin') return `${base}/dashboard/admin/candidates/${publicCode}`;
      if (role === 'employer') return `${base}/dashboard/employer/candidates/${publicCode}`;
    }
    if (entityTable === 'visa_cases') {
      if (role === 'lawyer') return `${base}/dashboard/lawyer/cases/${publicCode}`;
      if (role === 'admin') return `${base}/dashboard/admin/visas/${publicCode}`;
    }
  }

  return `${base}${listPath(role, entityTable)}`;
}
