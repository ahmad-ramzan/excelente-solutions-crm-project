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
      <div>© Since 1991</div>
    </footer>
  );
}
