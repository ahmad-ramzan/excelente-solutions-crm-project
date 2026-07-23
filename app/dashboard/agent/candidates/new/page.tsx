import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientForm from './ClientForm';
import { createClient } from '@/utils/supabase/server';
import { getOpenVacancyPositions } from '@/app/lib/queries';

export default async function AddCandidatePage() {
  const supabase = await createClient();

  // Fetch countries and positions for the form. Positions prefer live employer
  // vacancies; fall back to the full catalog when nothing is open right now.
  const [{ data: dbCountries }, { data: dbPositions }, vacancyPositions] = await Promise.all([
    supabase.from('countries').select('id, name').eq('is_active', true).order('name'),
    supabase.from('positions').select('id, name').eq('is_active', true).order('name'),
    getOpenVacancyPositions(supabase),
  ]);

  const countries = dbCountries || [];
  const positions = dbPositions || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Add candidate" role="agent" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add candidate</h1>
              <p className="ph-sub">Register a new candidate and upload their CV and photo. Status starts as Available.</p>
            </div>
          </div>

          <div className="card" style={{ padding: '32px 40px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', maxWidth: '900px' }}>
            <ClientForm countries={countries} positions={positions} vacancyPositions={vacancyPositions} />
          </div>
        </div>
      </div>
    </>
  );
}
