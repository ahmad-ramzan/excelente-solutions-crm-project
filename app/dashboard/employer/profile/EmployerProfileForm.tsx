'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateEmployerProfile } from '@/app/actions/employer-profile-actions';

export default function EmployerProfileForm({ employer }: { employer: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateEmployerProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="card" style={{ padding: '32px', background: 'var(--card)', borderRadius: '16px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.02)' }}>
      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '12px', background: '#dcf4e6', color: '#008a3d', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
          Profile updated successfully.
        </div>
      )}

      <input type="hidden" name="employerId" value={employer.id} />

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '24px' }}>Company Information</h2>

      <div className="resp-grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Company Name</label>
          <input type="text" name="name" defaultValue={employer.name} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Name of outlet</label>
          <input type="text" name="outletName" defaultValue={employer.outlet_name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country</label>
          <input type="text" readOnly value={employer.countries?.name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>City</label>
          <input type="text" name="city" defaultValue={employer.city || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>ZIP code</label>
          <input type="text" name="zipCode" defaultValue={employer.zip_code || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '24px' }}>Contact Person Details</h2>

      <div className="resp-grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Name of responsible person</label>
          <input type="text" name="contactName" defaultValue={employer.contact_name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Position of responsible person</label>
          <input type="text" name="contactPosition" defaultValue={employer.contact_position || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Email</label>
          <input type="email" name="email" defaultValue={employer.email || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Tel./WhatsApp</label>
          <input type="text" name="phone" defaultValue={employer.phone || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Address</label>
          <textarea name="address" defaultValue={employer.address || ''} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)', resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
        <button type="submit" disabled={loading} className="btn btn-gold" style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? <><span className="btn-spinner" />Saving...</> : 'Save Changes'}
        </button>
      </div>

    </form>
  );
}
