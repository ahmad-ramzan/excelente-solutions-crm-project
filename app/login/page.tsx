'use client';

import Link from 'next/link';
import FlowerLogo from '../components/FlowerLogo';
import { type Role } from '../lib/mock-data';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  function enterApp(role: Role) {
    router.push(`/dashboard/${role}`);
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

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="you@company.com"
            defaultValue="agent@excelente-solutions.com"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            defaultValue="············"
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
          className="btn btn-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          onClick={() => enterApp('agent')}
        >
          Sign in
        </button>

        <div className="alt">
          New to Excelente?{' '}
          <Link href="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>

        <hr className="soft" style={{ margin: '26px 0 16px' }} />

        <p className="small muted" style={{ textAlign: 'center', marginBottom: 10 }}>
          Demo — jump straight into any role&apos;s dashboard:
        </p>

        <div className="role-pick">
          <button className="role-opt" onClick={() => enterApp('admin')}>
            <b>Admin</b>
            <span>Full control</span>
          </button>
          <button className="role-opt" onClick={() => enterApp('salesperson')}>
            <b>Salesperson</b>
            <span>Employers &amp; orders</span>
          </button>
          <button className="role-opt" onClick={() => enterApp('agent')}>
            <b>Agent</b>
            <span>Candidates</span>
          </button>
          <button className="role-opt" onClick={() => enterApp('employer')}>
            <b>Employer</b>
            <span>Browse &amp; select</span>
          </button>
          <button
            className="role-opt"
            onClick={() => enterApp('lawyer')}
            style={{ gridColumn: 'span 2' }}
          >
            <b>Lawyer</b>
            <span>Visa processing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
