'use client';

import { useState } from 'react';
import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';
import { type Role } from '../lib/mock-data';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <p className="p">
          Your role decides where you land — admin, salesperson, agent, employer or lawyer.
        </p>

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
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              placeholder="••••••••••••"
              required
            />
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
            <a className="small" style={{ color: 'var(--gold)', fontWeight: 600, cursor: 'pointer' }}>
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
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
