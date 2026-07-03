'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployer } from '@/app/actions/employer-actions';

export default function ClientAddEmployerForm({ countries }: { countries: { id: string; name: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createEmployer(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/salesperson/employers');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Company name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="e.g. Petrov Construction LLC"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Country</label>
        <select
          name="countryId"
          required
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
        >
          <option value="">Select country</option>
          {countries.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Contact name</label>
        <input
          name="contactName"
          type="text"
          placeholder="Primary contact at the company"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
        />
      </div>

      <div className="resp-grid-2" style={{ marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Email</label>
          <input
            name="email"
            type="email"
            placeholder="contact@company.com"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Phone</label>
          <input
            name="phone"
            type="text"
            placeholder="+7 …"
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>Address</label>
        <input
          name="address"
          type="text"
          placeholder="Company address"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' }}
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
          {loading ? 'Saving...' : 'Save employer'}
        </button>
      </div>
    </form>
  );
}
