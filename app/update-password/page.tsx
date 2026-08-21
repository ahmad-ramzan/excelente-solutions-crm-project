'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';

function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const { updatePassword } = await import('../login/actions');
    
    try {
      const result = await updatePassword(formData);
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
        <h1>Set new password</h1>
        <p style={{ color: 'var(--slate)', marginBottom: '32px', fontSize: '15px' }}>
          Enter your new password below.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="field">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              placeholder="••••••••••••"
              required
            />
          </div>
          
          <div className="field">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              type="password"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '10px' }}
          >
            {loading ? <><span className="btn-spinner" />Updating...</> : 'Update password'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={null}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
