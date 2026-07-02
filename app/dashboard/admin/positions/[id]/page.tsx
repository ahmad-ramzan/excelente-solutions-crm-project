import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ClientEditPositionForm from './ClientEditPositionForm';

export default async function EditPositionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: position } = await supabase
    .from('positions')
    .select('*')
    .eq('id', id)
    .single();

  if (!position) notFound();

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Positions" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Edit position</h1>
              <p className="ph-sub">Update this job role.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientEditPositionForm position={position} />
          </div>
        </div>
      </div>
    </>
  );
}
