import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientAddUserForm from './ClientAddUserForm';

export default function AddUserPage() {
  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Users & roles" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add user</h1>
              <p className="ph-sub">Create an account directly — it's active immediately, no email confirmation needed.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientAddUserForm />
          </div>
        </div>
      </div>
    </>
  );
}
