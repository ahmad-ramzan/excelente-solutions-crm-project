'use client';

import AppSidebar from '../../../../components/AppSidebar';
import AppTopbar from '../../../../components/AppTopbar';
import { createCountry } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddCountryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createCountry(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/admin/countries');
    }
  };

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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Russia"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country code (2 letters)</label>
                <input
                  name="code"
                  type="text"
                  required
                  maxLength={2}
                  placeholder="e.g. RU"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn"
                  style={{ background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #7b61ff, #36b9ff)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Saving...' : 'Save country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
