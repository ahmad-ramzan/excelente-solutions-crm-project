import Link from 'next/link';
import PublicNav from './components/PublicNav';
import Footer from './components/Footer';
import FlowerLogo from './components/FlowerLogo';

export default function HomePage() {
  return (
    <>
      <PublicNav />

      {/* ===== HERO ===== */}
      <section className="hero hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">Workforce solutions across borders</div>
          <h1>
            The right people, placed <em>precisely</em> where needed.
          </h1>
          <p className="lede">
            For over three decades, Excelente Solutions has connected vetted candidates with employers
            across Russia, Greece, Poland and Romania — handling recruitment, documentation and visa
            processing end to end.
          </p>
          <div className="cta">
            <Link href="/register">
              <button className="btn btn-gold">Get started</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-ghost">Employer login</button>
            </Link>
          </div>
          <div className="since">
            <div>
              <div className="n">34</div>
              <div className="t">Years placing workforce</div>
            </div>
            <div>
              <div className="n">12k+</div>
              <div className="t">Candidates placed</div>
            </div>
            <div>
              <div className="n">9</div>
              <div className="t">Destination countries</div>
            </div>
            <div>
              <div className="n">100%</div>
              <div className="t">Legal &amp; compliant</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hv-card">
            <FlowerLogo size={172} className="hv-logo" />
            <div className="hv-name">Excelente Solutions</div>
            <div className="hv-sub">Recruitment · Since 1991</div>
          </div>
          <div className="hv-chip hv-c1">
            <span className="d" style={{ background: 'var(--blue)' }} />
            Welders · Russia
          </div>
          <div className="hv-chip hv-c2">
            <span className="d" style={{ background: 'var(--green)' }} />
            Drivers · Poland
          </div>
          <div className="hv-chip hv-c3">
            <span className="d" style={{ background: 'var(--amber)' }} />
            Chefs · Greece
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="band" id="how-it-works">
        <div className="band-in">
          <h2>How it works</h2>
          <p className="sub">
            One transparent pipeline from requirement to approved visa — every party sees exactly what
            they need, and nothing they don't.
          </p>
          <div className="steps">
            <div className="step">
              <div className="num">01</div>
              <h4>Requirement</h4>
              <p>Employers post job offers by country, position and headcount.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h4>Sourcing</h4>
              <p>Agents register and document vetted candidates for each market.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h4>Selection</h4>
              <p>Employers review profiles and reserve candidates instantly.</p>
            </div>
            <div className="step">
              <div className="num">04</div>
              <h4>Visa &amp; travel</h4>
              <p>In-country lawyers process documents through to approval.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <div className="feats">
        <div className="feat">
          <div className="ic">⬡</div>
          <h3>Affordable staffing</h3>
          <p>
            Transparent, flat-fee recruitment with no hidden margins — predictable cost per placement,
            agreed up front.
          </p>
        </div>
        <div className="feat">
          <div className="ic">⚖</div>
          <h3>Legal &amp; compliant</h3>
          <p>
            Country-licensed lawyers handle every visa application, so documentation is correct and
            defensible from day one.
          </p>
        </div>
        <div className="feat">
          <div className="ic">✦</div>
          <h3>Why us</h3>
          <p>
            Three decades of placements, dedicated salespeople per employer, and a single system
            tracking every candidate&apos;s status.
          </p>
        </div>
      </div>

      {/* ===== WHY ===== */}
      <section className="why" id="why-us">
        <div className="why-in">
          <div>
            <div className="eyebrow">Why Excelente</div>
            <h2>Built around trust, not paperwork.</h2>
          </div>
          <div className="ptlist">
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Country-locked visibility</strong>
                <span>Employers only ever see candidates cleared for their own market.</span>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Contact details stay private</strong>
                <span>Personal contact information is visible to administrators only.</span>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>One candidate, one assignment</strong>
                <span>Selected candidates are reserved instantly and hidden from others.</span>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Documented end to end</strong>
                <span>CVs, passports, health certificates and visas tracked in one place.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section className="contact" id="contact">
        <div>
          <div className="eyebrow">Get in touch</div>
          <h2>Let&apos;s staff your next project.</h2>
          <p className="lede">
            Tell us your country and headcount — we&apos;ll match candidates within days.
          </p>
          <Link href="/register">
            <button className="btn btn-gold">Create an account</button>
          </Link>
        </div>
        <div className="rows">
          <div className="row">
            <div className="k">Office</div>
            <div className="v">Excelente Solutions, 5 continents, 1 platform</div>
          </div>
          <div className="row">
            <div className="k">Email</div>
            <div className="v">hello@excelente-solutions.com</div>
          </div>
          <div className="row">
            <div className="k">Phone</div>
            <div className="v">+30 21 0000 1991</div>
          </div>
          <div className="row">
            <div className="k">Hours</div>
            <div className="v">Mon–Fri · 09:00–18:00 EET</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
