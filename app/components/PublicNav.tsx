'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

export default function PublicNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="pub-nav">
      <Link href="/">
        <Logo />
      </Link>

      {/* Desktop links */}
      <div className="links">
        <Link href="/">Home</Link>
        <a href="#how-it-works">How it works</a>
        <a href="#why-us">Why us</a>
        <a href="#contact">Contact</a>
        <Link href="/login" className="btn btn-ghost btn-sm">Log in</Link>
        <Link href="/register" className="btn btn-gold btn-sm">Register</Link>
      </div>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {menuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile dropdown menu */}
      <div className={`mobile-nav-menu ${menuOpen ? 'open' : ''}`}>
        <Link href="/" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px' }}>Home</Link>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px', color: 'var(--slate)' }}>How it works</a>
        <a href="#why-us" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px', color: 'var(--slate)' }}>Why us</a>
        <a href="#contact" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', fontWeight: 500, fontSize: '14px', color: 'var(--slate)' }}>Contact</a>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
          <Link href="/login" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Log in</Link>
          <Link href="/register" className="btn btn-gold btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Register</Link>
        </div>
      </div>
    </nav>
  );
}
