import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ClientEditTeamMemberForm from './ClientEditTeamMemberForm';

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (!member) notFound();

  const photoUrl = member.photo_path
    ? supabase.storage.from('team-photos').getPublicUrl(member.photo_path).data.publicUrl
    : null;

  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Our Team" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Edit team member</h1>
              <p className="ph-sub">Update their photo, name, or position.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientEditTeamMemberForm member={member} photoUrl={photoUrl} />
          </div>
        </div>
      </div>
    </>
  );
}
