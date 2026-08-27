'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const confirmed  = searchParams.get('confirmed') === 'true';

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const { login } = await import('./actions');
    
    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err) {
      // The redirect inside the action throws an error that Next.js catches,
      // but sometimes it can be caught here if not careful.
      // NEXT_REDIRECT is handled internally by Next.js
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
          &ldquo;The right hire is the one whose{' '}
          <b>papers are already in order.</b>&rdquo;
        </div>
        <div className="small" style={{ color: '#7d8d93' }}>
          Recruitment · Documentation · Visa processing
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form">
        <div className="eyebrow">Welcome back</div>
        <h1>Sign in to your dashboard</h1>

        {/* Registration success banner */}
        {registered && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '14px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            borderLeft: '4px solid #16a34a',
          }}>
            <strong>✅ Account created successfully!</strong>
            <br />
            We&apos;ve sent a confirmation email to your address. Click the link in the email to activate your account — you&apos;ll be taken straight to your dashboard.
          </div>
        )}

        {/* Email confirmed banner */}
        {confirmed && !registered && (
          <div style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: '14px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            borderLeft: '4px solid #2563eb',
          }}>
            <strong>📧 Email confirmed!</strong>
            <br />
            Your email address has been verified. You can now sign in below.
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>
         
          <div className="field">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                required
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '6px 0 22px',
            }}
          >
            <label
              className="small"
              style={{ display: 'flex', gap: 7, alignItems: 'center', color: 'var(--slate)' }}
            >
              <input type="checkbox" defaultChecked /> Keep me signed in
            </label>
            <Link href="/forgot-password" className="small" style={{ color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {loading ? <><span className="btn-spinner" />Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div className="alt">
          New to Excelente?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
