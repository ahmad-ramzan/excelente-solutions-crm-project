import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientForm from './ClientForm';
import { createClient } from '@/utils/supabase/server';

export default async function AddCandidatePage() {
  const supabase = await createClient();

  // Fetch countries and positions for the form
  const { data: dbCountries } = await supabase.from('countries').select('id, name').eq('is_active', true).order('name');
  const { data: dbPositions } = await supabase.from('positions').select('id, name').eq('is_active', true).order('name');

  const countries = dbCountries || [];
  const positions = dbPositions || [];

  return (
    <>
      <AppSidebar role="agent" />
      <div className="main">
        <AppTopbar section="Add candidate" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add candidate</h1>
              <p className="ph-sub">Register a new candidate and upload their CV and photo. Status starts as Available.</p>
            </div>
          </div>

          <div className="card" style={{ padding: '32px 40px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', maxWidth: '900px' }}>
            <ClientForm countries={countries} positions={positions} />
          </div>
        </div>
      </div>
    </>
  );
}
