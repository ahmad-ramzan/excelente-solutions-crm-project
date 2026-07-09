'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { roleConfig, type Role } from '../lib/mock-data';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: string;
}

const navByRole: Record<Role, { groups: { title: string; items: NavItem[] }[] }> = {
  admin: {
    groups: [
      {
        title: 'Overview',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/admin' },
        ],
      },
      {
        title: 'Setup',
        items: [
          { icon: '✦', label: 'Countries', href: '/dashboard/admin/countries' },
          { icon: '📋', label: 'Positions', href: '/dashboard/admin/positions' },
          { icon: '👤', label: 'Users & roles', href: '/dashboard/admin/users' },
        ],
      },
      {
        title: 'Operations',
        items: [
          { icon: '🏢', label: 'Employers', href: '/dashboard/admin/employers' },
          { icon: '👥', label: 'Candidates', href: '/dashboard/admin/candidates' },
          { icon: '📄', label: 'Job Offers', href: '/dashboard/admin/offers' },
          { icon: '🛂', label: 'Visa processes', href: '/dashboard/admin/visas' },
        ],
      },
    ],
  },
  salesperson: {
    groups: [
      {
        title: 'Overview',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/salesperson' },
        ],
      },
      {
        title: 'Pipeline',
        items: [
          { icon: '🏢', label: 'Employers', href: '/dashboard/salesperson/employers' },
          { icon: '📋', label: 'Job Offers', href: '/dashboard/salesperson/orders' },
          { icon: '✈️', label: 'Approved cases', href: '/dashboard/salesperson/cases' },
        ],
      },
    ],
  },
  agent: {
    groups: [
      {
        title: 'Overview',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/agent' },
        ],
      },
      {
        title: 'Candidates',
        items: [
          { icon: '🪪', label: 'My candidates', href: '/dashboard/agent/candidates' },
          { icon: '+', label: 'Add candidate', href: '/dashboard/agent/candidates/new' },
        ],
      },
    ],
  },
  employer: {
    groups: [
      {
        title: 'Overview',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/employer' },
        ],
      },
      {
        title: 'Recruit',
        items: [
          { icon: '🏢', label: 'Profile', href: '/dashboard/employer/profile' },
          { icon: '🔍', label: 'Select Candidates', href: '/dashboard/employer/candidates' },
          { icon: '📋', label: 'Vacancy Overview', href: '/dashboard/employer/offers' },
          { icon: '○', label: 'Vacant Positions', href: '/dashboard/employer/vacancies' },
          { icon: '✓', label: 'Selected Positions', href: '/dashboard/employer/selected' },
          { icon: '+', label: 'Add Vacancy', href: '/dashboard/employer/offers/new' },
        ],
      },
    ],
  },
  lawyer: {
    groups: [
      {
        title: 'OVERVIEW',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/lawyer' },
        ],
      },
      {
        title: 'CASEWORK',
        items: [
          { icon: '⚖️', label: 'Assigned cases', href: '/dashboard/lawyer/cases' },
        ],
      },
    ],
  },
};

export default function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const config = roleConfig[role];
  const { groups } = navByRole[role];

  const [userName, setUserName] = useState(config.user);
  const [userInitials, setUserInitials] = useState(config.initials);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName = user.user_metadata?.full_name || user.email;
        setUserName(fullName);
        setUserInitials((fullName.substring(0,2) || 'XX').toUpperCase());
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="side">
      <div className="logo" style={{ padding: '6px 8px 22px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* Inline flower mark */}
          <svg width="34" height="34" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A768FD" />
                <stop offset="52%" stopColor="#608FF7" />
                <stop offset="100%" stopColor="#1AB3F6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#sg1)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.85)" transform="rotate(0 50 50)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.75)" transform="rotate(60 50 50)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.65)" transform="rotate(120 50 50)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.85)" transform="rotate(180 50 50)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.75)" transform="rotate(240 50 50)" />
            <ellipse cx="50" cy="26" rx="9" ry="18" fill="rgba(255,255,255,0.65)" transform="rotate(300 50 50)" />
            <circle cx="50" cy="50" r="13" fill="#608FF7" />
            <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.9)" />
          </svg>
          <div>
            <div className="name">Excelente</div>
            <div className="sub">{config.label}</div>
          </div>
        </Link>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="nav-grp">{group.title}</div>
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button className={`nav ${isActive ? 'on' : ''}`}>
                    <span className="ic">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </button>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="who" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="av">{userInitials}</div>
          <div>
            <div className="nm">{userName}</div>
            <div className="rl">{config.role}</div>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          style={{ background: 'transparent', border: 'none', color: 'var(--slate)', cursor: 'pointer', padding: '4px' }}
          title="Sign out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </aside>
  );
}
