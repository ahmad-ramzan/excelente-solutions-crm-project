'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';
import { getActiveCountries } from '@/app/actions/admin-actions';

type RoleOpt = 'Employer' | 'Agent' | 'Salesperson' | 'Lawyer';

const roles: { label: RoleOpt; sub: string }[] = [
  { label: 'Employer', sub: 'I need to hire staff' },
  { label: 'Agent', sub: 'I source candidates' },
  { label: 'Salesperson', sub: 'I manage employers' },
  { label: 'Lawyer', sub: 'I process visas' },
];

function CountrySelect({ id, countries }: { id: string; countries: any[] }) {
  return (
    <select id={id} name="country" className="input" required defaultValue="">
      <option value="" disabled>Select country</option>
      {countries.map((c) => (
        <option key={c.id} value={c.name}>{c.name}</option>
      ))}
    </select>
  );
}

export default function RegisterPage() {
  const [selected, setSelected] = useState<RoleOpt>('Employer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCountries() {
      const data = await getActiveCountries();
      setCountries(data);
    }
    fetchCountries();
  }, []);

  function validatePasswords(form: HTMLFormElement): boolean {
    const pwd = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
    if (!pwd) {
      setPwdError('Password is required.');
      return false;
    }
    if (pwd.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return false;
    }
    if (pwd !== confirm) {
      setPwdError('Passwords do not match.');
      return false;
    }
    setPwdError(null);
    return true;
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPwdError(null);

    if (!validatePasswords(e.currentTarget)) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', selected);

    const { signup } = await import('../login/actions');

    try {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // If no error and no redirect happened (email confirmation flow), show success
    } catch (err: any) {
      // next/navigation redirect throws — that's expected on success
      if (err?.digest?.startsWith('NEXT_REDIRECT')) {
        return;
      }
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

        {success && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            ✅ Account created! Please check your email to confirm your address, then sign in.
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

        {/* Spacer between role picker and form */}
        <div style={{ height: 18 }} />

        <form onSubmit={handleRegister} noValidate>

          <div className="field">
            <label htmlFor="country">
              Country <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <CountrySelect id="country" countries={countries} />
          </div>

          {/* ── Responsible Person Name (all roles) ── */}
          <div className="row2">
            <div className="field">
              <label htmlFor="fullname">
                {selected === 'Salesperson' ? 'Full name' : 'Name of responsible person'} <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                id="fullname"
                name="fullname"
                className="input"
                placeholder={selected === 'Salesperson' ? 'Jane Doe' : 'Responsible person name'}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="phone">
                {selected === 'Salesperson' ? 'Tel./WhatsApp' : 'Tel. of responsible person'} <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input id="phone" name="phone" className="input" placeholder="+30 …" required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="regemail">
              Email address <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input id="regemail" name="email" className="input" type="email" placeholder="you@company.com" required />
          </div>

          {/* ── Employer-specific fields ── */}
          {selected === 'Employer' && (
            <>
              <div className="field">
                <label htmlFor="companyName">Name of Company <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="companyName" name="companyName" className="input" placeholder="Acme Construction Ltd" required />
              </div>
              <div className="field">
                <label htmlFor="outletName">Name of outlet <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="outletName" name="outletName" className="input" placeholder="Main Branch" required />
              </div>
              <div className="field">
                <label htmlFor="address">Address <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="address" name="address" className="input" placeholder="123 Street Name" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="position">Position of responsible person <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="position" name="position" className="input" placeholder="e.g. HR Manager" required />
              </div>
            </>
          )}

          {/* ── Agent-specific fields ── */}
          {selected === 'Agent' && (
            <>
              <div className="field">
                <label htmlFor="companyName">Name of Company <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="companyName" name="companyName" className="input" placeholder="Global Agents Inc." required />
              </div>
              <div className="field">
                <label htmlFor="address">Address <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="address" name="address" className="input" placeholder="123 Main Street" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="position">Position of responsible person <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="position" name="position" className="input" placeholder="e.g. Director" required />
              </div>
            </>
          )}

          {/* ── Lawyer-specific fields ── */}
          {selected === 'Lawyer' && (
            <>
              <div className="field">
                <label htmlFor="companyName">Name of Law Firm <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="companyName" name="companyName" className="input" placeholder="Legal Associates" required />
              </div>
              <div className="field">
                <label htmlFor="address">Address <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="address" name="address" className="input" placeholder="123 Main Street" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="position">Position of responsible person <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="position" name="position" className="input" placeholder="e.g. Director" required />
              </div>
            </>
          )}

          {/* ── Salesperson-specific fields ── */}
          {selected === 'Salesperson' && (
            <>
              <div className="field">
                <label htmlFor="address">Address <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="address" name="address" className="input" placeholder="123 Street Name" required />
              </div>
              <div className="row2">
                <div className="field">
                  <label htmlFor="city">City <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="city" name="city" className="input" placeholder="City Name" required />
                </div>
                <div className="field">
                  <label htmlFor="zipCode">ZIP code <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input id="zipCode" name="zipCode" className="input" placeholder="Postal Code" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="taxId">Tax ID <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="taxId" name="taxId" className="input" placeholder="Tax Identification Number" required />
              </div>
            </>
          )}

          {/* ── Password fields ── */}
          <div className="row2">
            <div className="field">
              <label htmlFor="regpwd">
                Password <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                id="regpwd"
                name="password"
                className="input"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                onChange={() => setPwdError(null)}
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">
                Confirm password <span style={{ color: 'var(--red)' }}>*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="input"
                type="password"
                placeholder="••••••••"
                required
                onChange={() => setPwdError(null)}
              />
            </div>
          </div>

          {pwdError && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              {pwdError}
            </div>
          )}

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
