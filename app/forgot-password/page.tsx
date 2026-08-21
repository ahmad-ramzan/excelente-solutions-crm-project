'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';

function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const { forgotPassword } = await import('../login/actions');
    
    try {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while attempting to reset your password.');
    } finally {
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
        <div className="eyebrow">Password Reset</div>
        <h1>Forgot your password?</h1>
        <p style={{ color: 'var(--slate)', marginBottom: '32px', fontSize: '15px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {success ? (
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
            <strong>✅ Reset email sent!</strong>
            <br />
            Check your inbox for a link to reset your password.
          </div>
        ) : (
          <form onSubmit={handleReset}>
            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

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

            <button
              type="submit"
              className="btn btn-gold"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '10px' }}
            >
              {loading ? <><span className="btn-spinner" />Sending...</> : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="alt">
          Remembered your password?{' '}
          <Link href="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
