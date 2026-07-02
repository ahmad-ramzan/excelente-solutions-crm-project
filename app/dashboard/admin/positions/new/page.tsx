import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientAddPositionForm from './ClientAddPositionForm';

export default function AddPositionPage() {
  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Positions" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add position</h1>
              <p className="ph-sub">Register a new job role.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientAddPositionForm />
          </div>
        </div>
      </div>
    </>
  );
}
