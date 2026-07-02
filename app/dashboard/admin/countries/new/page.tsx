import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import ClientAddCountryForm from './ClientAddCountryForm';

export default function AddCountryPage() {
  return (
    <>
      <AppSidebar role="admin" />
      <div className="main">
        <AppTopbar section="Countries" />
        <div className="wrap">
          <div className="page-head" style={{ marginBottom: '24px' }}>
            <div>
              <h1>Add country</h1>
              <p className="ph-sub">Register a new destination market.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '500px', padding: '32px' }}>
            <ClientAddCountryForm />
          </div>
        </div>
      </div>
    </>
  );
}
