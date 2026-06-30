'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { roleConfig, type Role } from '../lib/mock-data';

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
          { icon: '👥', label: 'Candidates', href: '/dashboard/admin/candidates', badge: '89' },
          { icon: '📄', label: 'Job Offers', href: '/dashboard/admin/offers' },
          { icon: '🛂', label: 'Visa processes', href: '/dashboard/admin/visas' },
          { icon: '🔔', label: 'Notifications', href: '/dashboard/admin/notifications' },
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
          { icon: '+', label: 'New Job Offer', href: '/dashboard/salesperson/orders/new' },
        ],
      },
      {
        title: 'Account',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/salesperson/notifications' },
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
          { icon: '🪪', label: 'My candidates', href: '/dashboard/agent/candidates', badge: '6' },
          { icon: '+', label: 'Add candidate', href: '/dashboard/agent/candidates/new' },
        ],
      },
      {
        title: 'Account',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/agent/notifications', badge: '2' },
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
          { icon: '🔍', label: 'Browse candidates', href: '/dashboard/employer/candidates' },
          { icon: '📋', label: 'My Job Offers', href: '/dashboard/employer/orders' },
          { icon: '+', label: 'New Job Offer', href: '/dashboard/employer/orders/new' },
          { icon: '✦', label: 'My selections', href: '/dashboard/employer/selections' },
        ],
      },
      {
        title: 'Account',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/employer/notifications' },
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
          { icon: '⚖️', label: 'Assigned cases', href: '/dashboard/lawyer/cases', badge: '3' },
        ],
      },
      {
        title: 'ACCOUNT',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/lawyer/notifications', badge: '1' },
        ],
      },
    ],
  },
};

export default function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const config = roleConfig[role];
  const { groups } = navByRole[role];

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

      <div className="who">
        <div className="av">{config.initials}</div>
        <div>
          <div className="nm">{config.user}</div>
          <div className="rl">{config.role}</div>
        </div>
      </div>
    </aside>
  );
}
