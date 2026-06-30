'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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

        <label className="small" style={{ fontWeight: 600, display: 'block', marginBottom: 9 }}>
          I am registering as
        </label>
        <div className="role-pick" id="reg-roles">
          {roles.map((r) => (
            <button
              key={r.label}
              className={`role-opt ${selected === r.label ? 'on' : ''}`}
              onClick={() => setSelected(r.label)}
            >
              <b>{r.label}</b>
              <span>{r.sub}</span>
            </button>
          ))}
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="fullname">Full name</label>
            <input id="fullname" className="input" placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" className="input" placeholder="+30 …" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="regemail">Email address</label>
          <input id="regemail" className="input" type="email" placeholder="you@company.com" />
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="country">Country</label>
            <select id="country" className="input">
              <option>Russia</option>
              <option>Greece</option>
              <option>Poland</option>
              <option>Romania</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="regpwd">Password</label>
            <input id="regpwd" className="input" type="password" placeholder="••••••••" />
          </div>
        </div>

        <button
          className="btn btn-gold"
          style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}
          onClick={() => router.push('/login')}
        >
          Create account
        </button>

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
