'use client';

import { useState } from 'react';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';

type RoleOpt = 'Employer' | 'Agent' | 'Salesperson' | 'Lawyer';

const roles: { label: RoleOpt; sub: string }[] = [
  { label: 'Employer', sub: 'I need to hire staff' },
  { label: 'Agent', sub: 'I source candidates' },
  { label: 'Salesperson', sub: 'I manage employers' },
  { label: 'Lawyer', sub: 'I process visas' },
];

export default function RegisterPage() {
  const [selected, setSelected] = useState<RoleOpt>('Employer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', selected);

    // The action will read 'fullname' directly from formData

    const { signup } = await import('../login/actions');

    try {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      {/* Left art panel */}
      <div className="auth-art">
        <Link href="/" style={{ display: 'inline-flex' }}>
          <div className="logo">
            <FlowerLogo size={34} />
            <div>
              <div className="name" style={{ color: '#fff' }}>
                Excelente Solutions
              </div>
              <div className="sub" style={{ color: '#7d8d93' }}>
                Since 1991
              </div>
            </div>
          </div>
        </Link>
        <div className="q">
          &ldquo;Three decades of placing the{' '}
          <b>right people</b> across borders.&rdquo;
        </div>
        <div className="small" style={{ color: '#7d8d93' }}>
          Join 12,000+ successful placements
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form">
        <div className="eyebrow">Create account</div>
        <h1>Register with Excelente</h1>
        <p className="p">
          Choose how you&apos;ll use the platform. An administrator confirms every new account.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <label className="small" style={{ fontWeight: 600, display: 'block', marginBottom: 9 }}>
          I am registering as
        </label>
        <div className="role-pick" id="reg-roles">
          {roles.map((r) => (
            <button
              key={r.label}
              type="button"
              className={`role-opt ${selected === r.label ? 'on' : ''}`}
              onClick={() => setSelected(r.label)}
            >
              <b>{r.label}</b>
              <span>{r.sub}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister}>
          <div className="row2">
            <div className="field">
              <label htmlFor="fullname">
                {selected === 'Lawyer' || selected === 'Agent' || selected === 'Employer' ? 'Name of responsible person' : selected === 'Salesperson' ? 'Name' : 'Full name'}
              </label>
              <input id="fullname" name="fullname" className="input" placeholder="Jane Doe" required />
            </div>
            <div className="field">
              <label htmlFor="phone">
                {selected === 'Lawyer' || selected === 'Agent' || selected === 'Employer' ? 'Tel./WhatsApp of responsible person' : selected === 'Salesperson' ? 'Tel./WhatsApp' : 'Phone'}
              </label>
              <input id="phone" name="phone" className="input" placeholder="+30 …" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="regemail">
              {selected === 'Employer' || selected === 'Salesperson' ? 'Email' : 'Email address'}
            </label>
            <input id="regemail" name="email" className="input" type="email" placeholder="you@company.com" required />
          </div>

          {selected === 'Employer' && (
            <>
              <div className="field">
                <label htmlFor="companyName">Name of Company</label>
                <input id="companyName" name="companyName" className="input" placeholder="Acme Construction Ltd" required />
              </div>
              <div className="field">
                <label htmlFor="outletName">Name of outlet</label>
                <input id="outletName" name="outletName" className="input" placeholder="Main Branch" required />
              </div>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" className="input" placeholder="123 Street Name" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code</label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="position">Position of responsible person</label>
                  <input id="position" name="position" className="input" placeholder="e.g. HR Manager" required />
                </div>
                <div className="field">
                  <label htmlFor="country">Country</label>
                  <select id="country" name="country" className="input" required defaultValue="">
                    <option value="" disabled>Select country</option>
                    <option>Russia</option>
                    <option>Greece</option>
                    <option>Poland</option>
                    <option>Romania</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {(selected === 'Lawyer' || selected === 'Agent') && (
            <>
              <div className="field">
                <label htmlFor="companyName">{selected === 'Lawyer' ? 'Name of Law Firm' : 'Name of Company'}</label>
                <input id="companyName" name="companyName" className="input" placeholder={selected === 'Lawyer' ? 'Legal Associates' : 'Global Agents Inc.'} required />
              </div>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" className="input" placeholder="123 Main Street" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code</label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="position">Position of responsible person</label>
                  <input id="position" name="position" className="input" placeholder="e.g. Director" required />
                </div>
                <div className="field">
                  <label htmlFor="country">Country</label>
                  <select id="country" name="country" className="input" required defaultValue="">
                    <option value="" disabled>Select country</option>
                    <option>Russia</option>
                    <option>Greece</option>
                    <option>Poland</option>
                    <option>Romania</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {selected === 'Salesperson' && (
            <>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" className="input" placeholder="123 Street Name" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City</label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code</label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="country">Country</label>
                  <select id="country" name="country" className="input" required defaultValue="">
                    <option value="" disabled>Select country</option>
                    <option>Russia</option>
                    <option>Greece</option>
                    <option>Poland</option>
                    <option>Romania</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="taxId">Tax ID</label>
                  <input id="taxId" name="taxId" className="input" placeholder="Tax Identification Number" required />
                </div>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="regpwd">Password</label>
            <input id="regpwd" name="password" className="input" type="password" placeholder="••••••••" required minLength={6} />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}
          >
            {loading ? <><span className="btn-spinner" />Creating account...</> : 'Create account'}
          </button>
        </form>

        <div className="alt">
          Already registered?{' '}
          <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
