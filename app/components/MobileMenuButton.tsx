'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function MobileMenuButton() {
  const pathname = usePathname();

  const closeSidebar = useCallback(() => {
    document.querySelector('.app')?.classList.remove('sidebar-open');
    document.querySelector('.sidebar-overlay')?.classList.remove('visible');
    document.body.style.overflow = '';
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Close on escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSidebar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeSidebar]);

  const toggleSidebar = useCallback(() => {
    const app = document.querySelector('.app');
    const overlay = document.querySelector('.sidebar-overlay');
    if (!app) return;

    const isOpen = app.classList.contains('sidebar-open');
    if (isOpen) {
      closeSidebar();
    } else {
      app.classList.add('sidebar-open');
      overlay?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  }, [closeSidebar]);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay backdrop */}
      <div className="sidebar-overlay" onClick={closeSidebar} />
    </>
  );
}
