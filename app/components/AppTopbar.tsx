'use client';

import Link from 'next/link';

interface AppTopbarProps {
  section: string;
}

export default function AppTopbar({ section }: AppTopbarProps) {
  return (
    <div className="topbar">
      <div className="crumb">
        Excelente Solutions{' '}
        <span style={{ margin: '0 6px', color: 'var(--line)' }}>/</span>
        <b>{section}</b>
      </div>
      <div className="tb-r">
        <div className="search">
          <span>🔍</span>
          <input placeholder="Search candidates, orders…" />
        </div>
        <button className="bell" aria-label="Notifications">
          🔔<span className="dot" />
        </button>
        <Link href="/login">
          <button className="btn btn-ghost btn-sm">Sign out</button>
        </Link>
      </div>
    </div>
  );
}
