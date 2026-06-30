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
        title: 'My Work',
        items: [
          { icon: '🏢', label: 'My Employers', href: '/dashboard/salesperson/employers' },
          { icon: '📋', label: 'Orders', href: '/dashboard/salesperson/orders', badge: '3' },
          { icon: '💰', label: 'Commission', href: '/dashboard/salesperson/commission' },
        ],
      },
      {
        title: 'Tools',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/salesperson/notifications', badge: '2' },
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
        title: 'My Candidates',
        items: [
          { icon: '👥', label: 'Candidates', href: '/dashboard/agent/candidates', badge: '18' },
          { icon: '➕', label: 'Add Candidate', href: '/dashboard/agent/add' },
          { icon: '📄', label: 'Documents', href: '/dashboard/agent/documents' },
        ],
      },
      {
        title: 'Updates',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/agent/notifications', badge: '3' },
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
        title: 'Hiring',
        items: [
          { icon: '👥', label: 'Browse Candidates', href: '/dashboard/employer/browse' },
          { icon: '📋', label: 'My Orders', href: '/dashboard/employer/orders' },
          { icon: '📍', label: 'Positions', href: '/dashboard/employer/positions' },
        ],
      },
      {
        title: 'Account',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/employer/notifications', badge: '1' },
        ],
      },
    ],
  },
  lawyer: {
    groups: [
      {
        title: 'Overview',
        items: [
          { icon: '⊞', label: 'Dashboard', href: '/dashboard/lawyer' },
        ],
      },
      {
        title: 'Cases',
        items: [
          { icon: '🛂', label: 'Visa Pipeline', href: '/dashboard/lawyer/visas', badge: '6' },
          { icon: '📄', label: 'Documents', href: '/dashboard/lawyer/documents' },
          { icon: '📋', label: 'Applications', href: '/dashboard/lawyer/applications' },
        ],
      },
      {
        title: 'Updates',
        items: [
          { icon: '🔔', label: 'Notifications', href: '/dashboard/lawyer/notifications' },
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
