import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import ClientAddEmployerForm from './ClientAddEmployerForm';

export default async function AddEmployerPage() {
  const supabase = await createClient();
  const { data: countries } = await supabase.from('countries').select('id, name').eq('is_active', true).order('name');

  return (
    <>
      <AppSidebar role="salesperson" />
      <div className="main">
        <AppTopbar section="Employers" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add employer</h1>
              <p className="ph-sub">Register a new company you manage recruitment for.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientAddEmployerForm countries={countries || []} />
          </div>
        </div>
      </div>
    </>
  );
}
