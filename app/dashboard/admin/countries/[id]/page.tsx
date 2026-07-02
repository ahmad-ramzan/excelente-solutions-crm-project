import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ClientEditCountryForm from './ClientEditCountryForm';

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('id', id)
    .single();

  if (!country) notFound();

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Countries" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Edit country</h1>
              <p className="ph-sub">Update this destination market.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientEditCountryForm country={country} />
          </div>
        </div>
      </div>
    </>
  );
}
