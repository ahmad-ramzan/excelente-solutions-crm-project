import AppSidebar from '@/app/components/AppSidebar';
import AppTopbar from '@/app/components/AppTopbar';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ClientEditOfferForm from './ClientEditOfferForm';
import { getActiveCountries } from '@/app/actions/admin-actions';

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Find the employer record for this user
  const { data: employerUser } = await supabase
    .from('employer_users')
    .select('employer_id')
    .eq('profile_id', user.id)
    .single();

  if (!employerUser) return null;

  // 2. Fetch the job offer
  const { data: offer } = await supabase
    .from('job_offers')
    .select('*')
    .eq('id', id)
    .eq('employer_id', employerUser.employer_id)
    .single();

  if (!offer) notFound();

  // 3. Fetch active positions & countries
  const { data: positions } = await supabase
    .from('positions')
    .select('id, name')
    .eq('is_active', true)
    .order('name');

  const countries = await getActiveCountries();

  return (
    <>
      <AppSidebar role="employer" />
      <div className="main">
        <AppTopbar section="Edit Vacancy" />
        <div className="wrap">
          <div style={{ marginBottom: '24px' }}>
            <Link href={`/dashboard/employer/offers/${id}`}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                ← Back to Vacancy Details
              </button>
            </Link>
          </div>

          <div className="page-head" style={{ marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px' }}>Edit Vacancy</h1>
              <p className="ph-sub" style={{ fontSize: '13.5px', marginTop: '6px' }}>
                Update details for Offer JO-{offer.id.substring(0, 6).toUpperCase()}
              </p>
            </div>
          </div>

          <ClientEditOfferForm
            offer={offer}
            positions={positions || []}
            countries={countries}
          />
        </div>
      </div>
    </>
  );
}
