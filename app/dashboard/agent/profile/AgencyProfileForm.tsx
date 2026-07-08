'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAgencyProfile } from '@/app/actions/agency-profile-actions';


export default function AgencyProfileForm({ agency }: { agency: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updateAgencyProfile(formData);

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

      <input type="hidden" name="agencyId" value={agency.id} />

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '24px' }}>Agency Information</h2>

      <div className="resp-grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Company Name</label>
          <input type="text" name="name" defaultValue={agency.name} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country</label>
          <input type="text" readOnly value={agency.countries?.name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#f8fafc', fontSize: '14px', color: 'var(--slate)', cursor: 'not-allowed' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--line)', margin: '32px 0' }}></div>

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '24px' }}>Contact Person Details</h2>

      <div className="resp-grid-2">
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Name of responsible person</label>
          <input type="text" name="contactName" defaultValue={agency.contact_name || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Email</label>
          <input type="email" name="email" defaultValue={agency.email || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Tel./WhatsApp</label>
          <input type="text" name="phone" defaultValue={agency.phone || ''} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Address & ZIP Code</label>
          <textarea name="address" defaultValue={agency.address || ''} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '14px', color: 'var(--ink)', resize: 'vertical' }} />
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
