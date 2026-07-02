import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ClientEditUserForm from './ClientEditUserForm';

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, status')
    .eq('id', id)
    .single();

  if (!user) notFound();

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Users & roles" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>{user.full_name}</h1>
              <p className="ph-sub">{user.email}</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientEditUserForm user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
