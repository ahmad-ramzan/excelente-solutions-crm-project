import Link from 'next/link';
import PublicNav from './components/PublicNav';
import Footer from './components/Footer';
import FlowerLogo from './components/FlowerLogo';
import SectionPhoto from './components/SectionPhoto';

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
            globally — handling recruitment, documentation and visa processing end to end.
          </p>
          <div className="cta">
            <Link href="/register">
              <button className="btn btn-gold">Register</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-ghost">Log in</button>
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
            <div className="hv-sub">International Recruitment &amp; Workforce Solutions · Since 1991</div>
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

      <SectionPhoto
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
        alt="A diverse team collaborating in a modern workplace"
      />

      {/* ===== FEATURES ===== */}
      <div className="feats">
        <div className="feat">
          <div className="ic">⬡</div>
          <h3>Affordable staffing</h3>
          <p>
            Excelente Solutions delivers low-cost, reliable international staff to employers, while
            ensuring 100% legal entry through valid work visas arranged by us.
          </p>
        </div>
        <div className="feat">
          <div className="ic">⚖</div>
          <h3>Legal &amp; compliant</h3>
          <p>
            Valid work visas secured, with full immigration &amp; labor compliance. Ethical, transparent
            recruitment — no shortcuts, no risk.
          </p>
        </div>
        <div className="feat">
          <div className="ic">✦</div>
          <h3>Why us</h3>
          <p>
            Lower staffing costs, reduced hiring risk and fast, reliable placement — a smarter way to
            build your workforce.
          </p>
        </div>
      </div>

      <SectionPhoto
        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
        alt="Two professionals shaking hands over an agreement"
      />

      {/* ===== LEGAL & COMPLIANT ===== */}
      <section className="why" id="legal">
        <div className="why-in">
          <div>
            <div className="eyebrow">Legal &amp; compliant</div>
            <h2>Fully Legal. Fully Compliant.</h2>
          </div>
          <div className="ptlist">
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Valid work visas secured</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Immigration &amp; labor compliance</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Ethical, transparent recruitment</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>No shortcuts. No risk.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section className="why" id="why-us">
        <div className="why-in">
          <div>
            <div className="eyebrow">Why us</div>
            <h2>Why Excelente Solutions?</h2>
          </div>
          <div className="ptlist">
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Lower staffing costs</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Reduced hiring risk</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Fast, reliable placement</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>Complete peace of mind</strong>
              </div>
            </div>
            <div className="pt">
              <span className="dot">✓</span>
              <div>
                <strong>A smarter way to build your workforce</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionPhoto
        src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80"
        alt="A professional team reviewing documents at a desk"
      />

      {/* ===== HOW IT WORKS ===== */}
      <section className="band" id="how-it-works">
        <div className="band-in">
          <h2>How it works</h2>
          <p className="sub">
            <strong>End-to-End Recruitment &amp; Visas.</strong> We manage the entire process—candidate
            selection, documentation, and work visa approvals—so employers receive work-ready staff
            without administrative burden or compliance risk.
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

      <SectionPhoto
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
        alt="A global network of connections across the world"
      />

      {/* ===== CONTACT ===== */}
      <section className="contact" id="contact">
        <div>
          <div className="eyebrow">Get in touch</div>
          <h2>Let&apos;s staff your next project.</h2>
          <p className="lede">
            Tell us your country and headcount — we&apos;ll match candidates within days.
          </p>
          <div className="cta">
            <Link href="/register">
              <button className="btn btn-gold">Register</button>
            </Link>
            <Link href="/login">
              <button className="btn btn-ghost">Log in</button>
            </Link>
          </div>
        </div>
        <div className="rows">
          <div className="row">
            <div className="k">Office</div>
            <div className="v">Excelente Solutions, 5 continents, 1 platform</div>
          </div>
          <div className="row">
            <div className="k">Email</div>
            <div className="v">office@excelente.my</div>
          </div>
          <div className="row">
            <div className="k">Tel. &amp; WhatsApp</div>
            <div className="v">+60 11 1542 2207</div>
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
