'use client';

import Link from 'next/link';
import Logo from './Logo';

export default function PublicNav() {
  return (
    <nav className="pub-nav">
      <Link href="/">
        <Logo />
      </Link>
      <div className="links">
        <Link href="/">Home</Link>
        <a href="#how-it-works">How it works</a>
        <a href="#why-us">Why us</a>
        <a href="#contact">Contact</a>
        <Link href="/login">
          <button className="btn btn-ghost btn-sm">Log in</button>
        </Link>
        <Link href="/register">
          <button className="btn btn-gold btn-sm">Register</button>
        </Link>
      </div>
    </nav>
  );
}
