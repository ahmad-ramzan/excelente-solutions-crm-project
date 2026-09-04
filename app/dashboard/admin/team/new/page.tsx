import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientAddTeamMemberForm from './ClientAddTeamMemberForm';

export default function AddTeamMemberPage() {
  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Our Team" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add team member</h1>
              <p className="ph-sub">They'll appear in the "Our Team" section on the homepage.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientAddTeamMemberForm />
          </div>
        </div>
      </div>
    </>
  );
}
