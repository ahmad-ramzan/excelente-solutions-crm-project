import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="fl">
        <Link href="/">
          <Logo variant="dark" />
        </Link>
      </div>
      <div>© 1991–2026 Excelente Solutions. International Recruitment &amp; Workforce Solutions.</div>
    </footer>
  );
}
