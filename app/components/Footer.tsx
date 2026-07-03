import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="fl">
        <Link href="/">
          <Logo variant="dark" subtext="Legal Workforce · Cost-Efficient · Fully Compliant" />
        </Link>
      </div>
      <div>© 1991–2026 Excelente Solutions. Legal Workforce · Cost-Efficient · Fully Compliant.</div>
    </footer>
  );
}
