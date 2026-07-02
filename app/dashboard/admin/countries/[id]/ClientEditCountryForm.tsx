'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCountry } from '@/app/actions/admin-actions';

export default function ClientEditCountryForm({ country }: { country: { id: string; name: string; code: string; is_active: boolean } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await updateCountry(country.id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/admin/countries');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country name</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={country.name}
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
          defaultValue={country.code}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)', textTransform: 'uppercase' }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
        <input type="checkbox" name="isActive" defaultChecked={country.is_active} />
        Active
      </label>

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
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
