'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const screens = [
  { key: 'home', label: 'Public site', href: '/' },
  { key: 'login', label: 'Login', href: '/login' },
  { key: 'register', label: 'Register', href: '/register' },
  { key: 'admin', label: 'Admin', href: '/dashboard/admin' },
  { key: 'salesperson', label: 'Salesperson', href: '/dashboard/salesperson' },
  { key: 'agent', label: 'Agent', href: '/dashboard/agent' },
  { key: 'employer', label: 'Employer', href: '/dashboard/employer' },
  { key: 'lawyer', label: 'Lawyer', href: '/dashboard/lawyer' },
];

export default function ProtoSwitcher() {
  const pathname = usePathname();

  function isActive(screen: (typeof screens)[0]) {
    if (screen.href === '/') return pathname === '/';
    return pathname.startsWith(screen.href);
  }

  return (
    <div className="proto">
      <span className="lbl">View as</span>
      {screens.map((s) => (
        <Link key={s.key} href={s.href}>
          <button className={isActive(s) ? 'on' : ''}>{s.label}</button>
        </Link>
      ))}
    </div>
  );
}
