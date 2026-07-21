'use client';

import { createUserByAdmin, getActiveCountries } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ClientAddUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('agent');
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCountries() {
      const data = await getActiveCountries();
      setCountries(data);
    }
    fetchCountries();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await createUserByAdmin(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/dashboard/admin/users');
    }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line)', background: '#fff', fontSize: '13.5px', color: 'var(--ink)' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={{ color: 'var(--red)', fontSize: '13px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

      <div>
        <label style={labelStyle}>Role</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="admin">Admin</option>
          <option value="salesperson">Salesperson</option>
          <option value="agent">Agent</option>
          <option value="employer">Employer</option>
          <option value="lawyer">Lawyer</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Full name</label>
        <input name="fullName" type="text" required placeholder="Jane Doe" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Email address</label>
        <input name="email" type="email" required placeholder="jane@company.com" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Temporary password</label>
        <input name="password" type="text" required minLength={6} placeholder="At least 6 characters" style={inputStyle} />
      </div>

      {role !== 'admin' && (
        <>
          <div>
            <label style={labelStyle}>Country</label>
            <select name="country" required defaultValue="" style={inputStyle}>
              <option value="" disabled>Select country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tel./WhatsApp</label>
            <input name="phone" required placeholder="+1 234 567 8900" style={inputStyle} />
          </div>
        </>
      )}

      {role === 'employer' && (
        <>
          <div>
            <label style={labelStyle}>Name of Company</label>
            <input name="companyName" required placeholder="Acme Construction Ltd" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Name of outlet</label>
            <input name="outletName" required placeholder="Main Branch" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input name="address" required placeholder="123 Street Name" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" required placeholder="City Name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ZIP code</label>
              <input name="zipCode" required placeholder="Postal Code" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Position of responsible person</label>
            <input name="position" required placeholder="e.g. HR Manager" style={inputStyle} />
          </div>
        </>
      )}

      {(role === 'agent' || role === 'lawyer') && (
        <>
          <div>
            <label style={labelStyle}>{role === 'lawyer' ? 'Name of Law Firm' : 'Name of Company'}</label>
            <input name="companyName" required placeholder={role === 'lawyer' ? 'Legal Associates' : 'Global Agents Inc.'} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Address</label>
            <input name="address" required placeholder="123 Main Street" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" required placeholder="City Name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ZIP code</label>
              <input name="zipCode" required placeholder="Postal Code" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Position of responsible person</label>
            <input name="position" required placeholder="e.g. Director" style={inputStyle} />
          </div>
        </>
      )}

      {role === 'salesperson' && (
        <>
          <div>
            <label style={labelStyle}>Address</label>
            <input name="address" required placeholder="123 Street Name" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" required placeholder="City Name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ZIP code</label>
              <input name="zipCode" required placeholder="Postal Code" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Tax ID</label>
            <input name="taxId" required placeholder="Tax Identification Number" style={inputStyle} />
          </div>
        </>
      )}

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
          {loading ? <><span className="btn-spinner" />Creating...</> : 'Create user'}
        </button>
      </div>
    </form>
  );
}
