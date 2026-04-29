import { useState, useEffect, useRef } from 'react';
import { fetchServices, fetchEmployees, fetchWebfrontConfig, fetchBookingConfig, fetchGoogleReviews } from '../../lib/firestore';

// ── Brand ───────────────────────────────────────────────
const G  = '#2D7A5F';   // Meraki green
const B  = '#3D95CE';   // Meraki blue
const DK = '#0e1c14';   // deep dark green-black for hero

const DEFAULT_CFG = {
  tagline:   'A Columbus-based salon specializing in Manicure, Pedicure, Dip, Gel-X, Gel Manicure & Nail Art.',
  about:     'We are a Columbus-based salon specializing in Manicure, Pedicure, Dip powder, Gel-X, Gel manicure & Nail Art. We are committed to maintaining high hygiene standards and exceeding customer expectations in everything we do.',
  policy:    'Appointments canceled with less than 24 hours notice and/or no-shows are subject to a cancellation fee of 50% of all scheduled service(s).',
  phone:     '',
  address:   '5029 Olentangy River Rd\nColumbus, OH 43214',
  mapsUrl:   'https://maps.google.com/?q=5029+Olentangy+River+Rd+Columbus+OH+43214',
  googleReviewUrl: '',
  instagram: 'meraki_cbus',
  facebook:  '',
  tiktok:    '',
  hours: {
    mon: '10:00 AM – 7:00 PM',
    tue: '10:00 AM – 7:00 PM',
    wed: '10:00 AM – 7:00 PM',
    thu: '10:00 AM – 7:00 PM',
    fri: '10:00 AM – 7:00 PM',
    sat: '10:00 AM – 6:00 PM',
    sun: '11:00 AM – 4:00 PM',
  },
  showBookingCta: true,
  showServices:   true,
  showTeam:       true,
  showReviews:    true,
  hiddenEmployeeIds: [],
  testimonials: [],
};

const DAY_LABELS = [
  ['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],
  ['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday'],
];

// Fallback services if Firestore hasn't been seeded yet
const FALLBACK_SERVICES = [
  { id:'gel-x',       category:'Gel Services',      name:'Gel-X',                    description:'Fully 100% soft gel tip in your choice of shape and length.',                              price:70,  duration:60 },
  { id:'struct-gel',  category:'Gel Services',      name:'Structured Gel Manicure',  description:'Thicker gel application designed to reinforce natural nails — best for short to medium length.',   price:50,  duration:60 },
  { id:'gel-mani',    category:'Gel Services',      name:'Gel Manicure',             description:'Includes trimming, shaping, buffing, cuticle care, and massage.',                         price:40,  duration:35 },
  { id:'dip',         category:'Powder & Polish',   name:'Dip',                      description:'Pigmented powders used to create a long-lasting, durable finish.',                        price:15,  duration:10 },
  { id:'nail-art',    category:'Powder & Polish',   name:'Nail Art',                 description:'Custom nail art designs.',                                                                price:5,   duration:10 },
  { id:'gel-change',  category:'Powder & Polish',   name:'Gel Polish Change',        description:'',                                                                                         price:32,  duration:30 },
  { id:'toe-change',  category:'Powder & Polish',   name:'Toe Polish Change',        description:'',                                                                                         price:20,  duration:20 },
  { id:'spa-mani',    category:'Manicures',         name:'Spa Manicure',             description:'Classic spa manicure.',                                                                    price:25,  duration:30 },
  { id:'sig-mani',    category:'Manicures',         name:'Signature Manicure',       description:'Includes steam and exfoliation.',                                                          price:32,  duration:35 },
  { id:'dlx-mani',    category:'Manicures',         name:'Deluxe Manicure',          description:'Includes mud mask and paraffin wax.',                                                      price:40,  duration:40 },
  { id:'spa-pedi',    category:'Pedicures',         name:'Spa Pedicure',             description:'Classic relaxing pedicure.',                                                               price:40,  duration:35 },
  { id:'sig-pedi',    category:'Pedicures',         name:'Signature Pedicure',       description:'Includes sugar scrub and mud mask.',                                                       price:52,  duration:45 },
  { id:'dlx-pedi',    category:'Pedicures',         name:'Deluxe Pedicure',          description:'Includes hot stones.',                                                                     price:65,  duration:60 },
  { id:'repair',      category:'Add-ons & Extras',  name:'Nail Repair',              description:'',                                                                                         price:5,   duration:15 },
  { id:'removal',     category:'Add-ons & Extras',  name:'Removal',                  description:'',                                                                                         price:10,  duration:20 },
  { id:'paraffin',    category:'Add-ons & Extras',  name:'Luxury Paraffin Treatment',description:'',                                                                                         price:15,  duration:15 },
];

function groupByCategory(services) {
  const map = {};
  services.forEach(s => {
    const c = s.category || 'Services';
    if (!map[c]) map[c] = [];
    map[c].push(s);
  });
  return Object.entries(map);
}

export default function SalonWebfront() {
  const [cfg,          setCfg]          = useState(null);
  const [services,     setServices]     = useState([]);
  const [employees,    setEmployees]    = useState([]);
  const [bookCfg,      setBookCfg]      = useState(null);
  const [googleData,   setGoogleData]   = useState(null);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [navSolid,     setNavSolid]     = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetchWebfrontConfig(),
      fetchServices(),
      fetchEmployees(),
      fetchBookingConfig(),
      fetchGoogleReviews(),
    ]).then(([wf, svcs, emps, bk, gr]) => {
      setCfg({ ...DEFAULT_CFG, ...wf });
      const active = svcs.filter(s => s.active !== false);
      setServices(active.length ? active : FALLBACK_SERVICES);
      setEmployees(emps.filter(e => e.active !== false));
      setBookCfg(bk);
      setGoogleData(gr);
    }).catch(() => {
      setCfg(DEFAULT_CFG);
      setServices(FALLBACK_SERVICES);
    });
  }, []);

  useEffect(() => {
    function onScroll() { setNavSolid(window.scrollY > 60); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!cfg) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: DK }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${G}`, borderTopColor: 'transparent', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const hidden   = new Set(cfg.hiddenEmployeeIds || []);
  const visTeam  = employees.filter(e => !hidden.has(e.id));
  const showBook = cfg.showBookingCta && bookCfg?.enabled;
  const bookUrl  = `${window.location.origin}/?book=1`;

  function scrollTo(id) {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  const navLinks = [
    { label: 'About',    id: 'about'    },
    cfg.showTeam     && { label: 'Team',     id: 'team'     },
    cfg.showServices && { label: 'Services', id: 'services' },
    { label: 'Contact',  id: 'contact'  },
  ].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", color: '#1a1a1a', background: '#fff', overflowX: 'hidden' }}>

      {/* ── Nav ────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 68,
        background: navSolid ? 'rgba(14,28,20,.97)' : 'transparent',
        backdropFilter: navSolid ? 'blur(12px)' : 'none',
        borderBottom: navSolid ? '1px solid rgba(255,255,255,.08)' : 'none',
        transition: 'background .25s, border-color .25s',
        padding: '0 clamp(16px,5vw,56px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${G},${B})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 60 60" fill="none" width={19} height={19}><circle cx="30" cy="22" r="7" fill="white"/><path d="M14 50c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="white" strokeWidth="3.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.06em' }}>Meraki Nail Studio</span>
        </button>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="wf-nav-desktop">
          {navLinks.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.02em', padding: 0, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,.8)'}>
              {l.label}
            </button>
          ))}
          {showBook && (
            <a href={bookUrl}
              style={{ height: 38, borderRadius: 19, background: G, color: '#fff', fontSize: 13, fontWeight: 700, padding: '0 22px', display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: `0 2px 12px ${G}66`, letterSpacing: '.02em', transition: 'opacity .15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='.85'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}>
              Book Now
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(o => !o)} className="wf-nav-mobile"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'none' }}>
          {menuOpen
            ? <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99, background: 'rgba(14,28,20,.98)', borderBottom: `1px solid ${G}33`, padding: '8px 0 20px' }}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,.9)', cursor: 'pointer', fontFamily: 'inherit', padding: '13px clamp(16px,5vw,40px)' }}>
              {l.label}
            </button>
          ))}
          {showBook && (
            <div style={{ padding: '8px clamp(16px,5vw,40px) 0' }}>
              <a href={bookUrl} style={{ display: 'block', textAlign: 'center', background: G, color: '#fff', fontSize: 14, fontWeight: 700, padding: '13px', borderRadius: 12, textDecoration: 'none' }}>
                Book an Appointment
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Hero ─────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: DK, overflow: 'hidden', padding: '100px clamp(20px,6vw,80px) 80px' }}>
        {/* Background texture — subtle radial glow */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${G}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', right: '-5%', width: '45vw', maxWidth: 500, aspectRatio: '1', borderRadius: '50%', background: `${G}0a`, border: `1px solid ${G}15`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-8%', width: '35vw', maxWidth: 400, aspectRatio: '1', borderRadius: '50%', background: `${B}08`, border: `1px solid ${B}12`, pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${G}22`, border: `1px solid ${G}44`, borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, flexShrink: 0, boxShadow: `0 0 6px ${G}` }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#7fc8a6', letterSpacing: '.1em', textTransform: 'uppercase' }}>Columbus, Ohio</span>
          </div>

          <div style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(64px,14vw,108px)', color: '#fff', lineHeight: 1.0, marginBottom: 6 }}>
            Meraki
          </div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(13px,2.5vw,18px)', color: 'rgba(255,255,255,.5)', letterSpacing: '.32em', textTransform: 'uppercase', marginBottom: 36 }}>
            Nail Studio
          </div>

          <p style={{ fontSize: 'clamp(15px,2vw,17px)', color: 'rgba(255,255,255,.65)', lineHeight: 1.75, marginBottom: 48, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            {cfg.tagline}
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {showBook && (
              <a href={bookUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 54, borderRadius: 27, background: G, color: '#fff', fontSize: 15, fontWeight: 700, padding: '0 36px', textDecoration: 'none', boxShadow: `0 4px 24px ${G}55`, letterSpacing: '.02em' }}>
                Book an Appointment
              </a>
            )}
            <button onClick={() => scrollTo('services')}
              style={{ height: 54, borderRadius: 27, background: 'transparent', color: 'rgba(255,255,255,.85)', fontSize: 15, fontWeight: 600, padding: '0 36px', border: '1.5px solid rgba(255,255,255,.22)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.02em', backdropFilter: 'blur(4px)' }}>
              View Services
            </button>
          </div>
        </div>

        {/* Scroll chevron */}
        <div onClick={() => scrollTo('about')} style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'float 2.5s ease-in-out infinite' }}>
          <span>Scroll</span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* ── About ───────────────────────────────────── */}
      <section id="about" style={{ padding: 'clamp(64px,10vw,96px) clamp(20px,6vw,80px)', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(40px,6vw,72px)', alignItems: 'center' }}>
          {/* Brand mark */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 'clamp(200px,30vw,280px)', aspectRatio: '1' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(145deg,${G}18,${B}10)`, border: `1px solid ${G}22` }} />
              <div style={{ position: 'absolute', inset: '12%', borderRadius: '50%', background: `linear-gradient(145deg,${G}28,${B}18)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Great Vibes',cursive", fontSize: 'clamp(36px,8vw,52px)', color: G, lineHeight: 1 }}>Meraki</div>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(8px,1.5vw,10px)', color: '#7fc8a6', letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 4 }}>Nail Studio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <EyebrowLabel>About Us</EyebrowLabel>
            <h2 style={{ fontSize: 'clamp(26px,4vw,36px)', fontWeight: 800, color: '#0e1c14', lineHeight: 1.2, margin: '10px 0 20px' }}>
              Where nails<br />become <span style={{ color: G }}>art.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#4a5568', lineHeight: 1.8, marginBottom: 20 }}>
              {cfg.about}
            </p>
            {cfg.policy && (
              <div style={{ background: '#f7faf8', border: `1px solid ${G}22`, borderLeft: `3px solid ${G}`, borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Cancellation Policy</div>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, margin: 0 }}>{cfg.policy}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────── */}
      {cfg.showTeam && visTeam.length > 0 && (
        <section id="team" style={{ padding: 'clamp(64px,10vw,96px) clamp(20px,6vw,80px)', background: '#f7faf8' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <EyebrowLabel>The Crew</EyebrowLabel>
              <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: '#0e1c14', marginTop: 10 }}>Our Team</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 'clamp(16px,3vw,28px)' }}>
              {visTeam.map(emp => <TeamCard key={emp.id} emp={emp} />)}
            </div>
            {showBook && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <a href={bookUrl} style={{ display: 'inline-flex', alignItems: 'center', height: 48, borderRadius: 24, background: G, color: '#fff', fontSize: 14, fontWeight: 700, padding: '0 30px', textDecoration: 'none' }}>
                  Book with a Technician
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Services ─────────────────────────────────── */}
      {cfg.showServices && (
        <section id="services" style={{ padding: 'clamp(64px,10vw,96px) clamp(20px,6vw,80px)', background: '#fff' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <EyebrowLabel>What We Offer</EyebrowLabel>
              <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: '#0e1c14', marginTop: 10 }}>Services</h2>
            </div>
            {groupByCategory(services).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ height: 1, flex: 1, background: `${G}22` }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: G, flexShrink: 0 }}>{cat}</span>
                  <div style={{ height: 1, flex: 1, background: `${G}22` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
                  {items.map(svc => <ServiceCard key={svc.id} svc={svc} />)}
                </div>
              </div>
            ))}
            {showBook && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <a href={bookUrl} style={{ display: 'inline-flex', alignItems: 'center', height: 50, borderRadius: 25, background: G, color: '#fff', fontSize: 14, fontWeight: 700, padding: '0 32px', textDecoration: 'none' }}>
                  Book Now
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Reviews ─────────────────────────────────── */}
      {cfg.showReviews && (() => {
        const gReviews   = googleData?.reviews?.filter(r => r.text) || [];
        const manualRevs = cfg.testimonials || [];
        const displayRevs = gReviews.length ? gReviews : manualRevs;
        const isGoogle   = gReviews.length > 0;
        if (!displayRevs.length) return null;
        return (
          <section id="reviews" style={{ padding: 'clamp(64px,10vw,96px) clamp(20px,6vw,80px)', background: '#f7faf8' }}>
            <div style={{ maxWidth: 1080, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <EyebrowLabel>Happy Clients</EyebrowLabel>
                <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: '#0e1c14', marginTop: 10 }}>What People Are Saying</h2>
                {isGoogle && googleData.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1,2,3,4,5].map(n => (
                        <svg key={n} width={22} height={22} viewBox="0 0 24 24" fill={n <= Math.round(googleData.rating) ? '#f59e0b' : '#e0e0e0'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                      ))}
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#0e1c14' }}>{Number(googleData.rating).toFixed(1)}</span>
                    {googleData.userRatingCount && (
                      <span style={{ fontSize: 14, color: '#718096' }}>({googleData.userRatingCount.toLocaleString()} reviews)</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20, padding: '4px 12px' }}>
                      <GoogleGLogo size={16} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Google</span>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                {displayRevs.map((r, i) => <ReviewCard key={i} review={r} isGoogle={isGoogle} googleReviewUrl={cfg.googleReviewUrl} />)}
              </div>
              {cfg.googleReviewUrl && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <a href={cfg.googleReviewUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 48, borderRadius: 24, background: '#fff', color: '#333', fontSize: 14, fontWeight: 600, padding: '0 28px', textDecoration: 'none', border: '1.5px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,.07)' }}>
                    <GoogleGLogo size={18} />
                    See all Google reviews ↗
                  </a>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── Hours & Contact ──────────────────────────── */}
      <section id="contact" style={{ padding: 'clamp(64px,10vw,96px) clamp(20px,6vw,80px)', background: DK }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <EyebrowLabel light>Visit Us</EyebrowLabel>
            <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, color: '#fff', marginTop: 10 }}>Hours & Contact</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 40 }}>

            {/* Hours */}
            <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '28px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7fc8a6', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>Business Hours</div>
              {DAY_LABELS.map(([key, label]) => {
                const h = cfg.hours?.[key] || 'Closed';
                const closed = h.toLowerCase() === 'closed';
                const today  = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
                const isToday = key === today;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    <span style={{ fontSize: 13, color: isToday ? '#7fc8a6' : 'rgba(255,255,255,.65)', fontWeight: isToday ? 700 : 400 }}>{label}</span>
                    <span style={{ fontSize: 13, color: closed ? 'rgba(255,255,255,.25)' : isToday ? '#fff' : 'rgba(255,255,255,.8)', fontWeight: isToday ? 700 : 400 }}>{h}</span>
                  </div>
                );
              })}
            </div>

            {/* Address + Socials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {cfg.address && (
                <ContactBlock icon="📍" label="Address" light>
                  <a href={cfg.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(cfg.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: '#7fc8a6', textDecoration: 'none', fontSize: 15, lineHeight: 1.6, display: 'block' }}>
                    {cfg.address.split('\n').map((line, i) => <span key={i} style={{ display: 'block' }}>{line}</span>)}
                  </a>
                </ContactBlock>
              )}
              {cfg.phone && (
                <ContactBlock icon="📞" label="Phone" light>
                  <a href={`tel:${cfg.phone.replace(/\D/g,'')}`} style={{ color: '#7fc8a6', textDecoration: 'none', fontSize: 15 }}>{cfg.phone}</a>
                </ContactBlock>
              )}
              {(cfg.instagram || cfg.facebook || cfg.tiktok) && (
                <ContactBlock icon="✦" label="Follow Us" light>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
                    {cfg.instagram && (
                      <a href={`https://instagram.com/${cfg.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '6px 14px', fontWeight: 600 }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        @{cfg.instagram.replace('@','')}
                      </a>
                    )}
                    {cfg.facebook && (
                      <a href={`https://facebook.com/${cfg.facebook.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '6px 14px', fontWeight: 600 }}>
                        Facebook
                      </a>
                    )}
                    {cfg.tiktok && (
                      <a href={`https://tiktok.com/@${cfg.tiktok.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '6px 14px', fontWeight: 600 }}>
                        TikTok
                      </a>
                    )}
                  </div>
                </ContactBlock>
              )}

              {showBook && (
                <a href={bookUrl} style={{ display: 'inline-flex', alignItems: 'center', height: 50, borderRadius: 25, background: G, color: '#fff', fontSize: 14, fontWeight: 700, padding: '0 32px', textDecoration: 'none', alignSelf: 'flex-start', marginTop: 4, boxShadow: `0 4px 20px ${G}44` }}>
                  Book an Appointment →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{ background: '#071009', color: 'rgba(255,255,255,.35)', padding: '28px clamp(20px,6vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg,${G},${B})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 60 60" fill="none" width={13} height={13}><circle cx="30" cy="22" r="7" fill="white"/><path d="M14 50c0-8.8 7.2-16 16-16s16 7.2 16 16" stroke="white" strokeWidth="3.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontFamily: 'Cinzel,serif', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em' }}>Meraki Nail Studio</span>
        </div>
        <div style={{ fontSize: 11 }}>© {new Date().getFullYear()} Meraki Nail Studio · Columbus, OH</div>
        <a href={`${window.location.origin}/`} style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', textDecoration: 'none' }}>Staff Login</a>
      </footer>

      <style>{`
        @media (max-width: 660px) {
          .wf-nav-desktop { display: none !important; }
          .wf-nav-mobile  { display: flex !important; }
        }
        @keyframes float {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%      { transform: translateX(-50%) translateY(7px); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────

function EyebrowLabel({ children, light }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{ height: 1, width: 24, background: G }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: light ? '#7fc8a6' : G }}>{children}</span>
      <div style={{ height: 1, width: 24, background: G }} />
    </div>
  );
}

function ServiceCard({ svc }) {
  const [hover,  setHover]  = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const hasImg = svc.image && !imgErr;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#fff', border: `1px solid ${hover ? G+'55' : '#e8e8e8'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .15s, box-shadow .15s', boxShadow: hover ? `0 4px 20px ${G}18` : '0 1px 4px rgba(0,0,0,.05)', cursor: 'default' }}>
      {hasImg && (
        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f0f0f0' }}>
          <img src={svc.image} alt={svc.name} onError={() => setImgErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        </div>
      )}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0e1c14', marginBottom: svc.description ? 4 : 0 }}>{svc.name}</div>
            {svc.description && <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5 }}>{svc.description}</div>}
            {svc.duration > 0 && <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 5 }}>{svc.duration}+ min</div>}
          </div>
          {svc.price > 0 && (
            <div style={{ fontSize: 15, fontWeight: 800, color: G, flexShrink: 0, paddingTop: 1 }}>${Number(svc.price).toFixed(0)}+</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamCard({ emp }) {
  const ig = emp.instagram?.replace('@','');
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 'clamp(80px,12vw,110px)', height: 'clamp(80px,12vw,110px)', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', background: `linear-gradient(135deg,${G}33,${B}22)`, border: `2px solid ${G}22`, flexShrink: 0 }}>
        {emp.photo
          ? <img src={emp.photo} alt={emp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Great Vibes',cursive", fontSize: 28, color: G }}>
              {(emp.name || '?')[0]}
            </div>
        }
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0e1c14', marginBottom: 3 }}>{emp.name}</div>
      {ig
        ? <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: G, textDecoration: 'none', fontWeight: 500 }}>@{ig}</a>
        : <div style={{ fontSize: 11, color: '#aaa' }}>Nail Technician</div>
      }
    </div>
  );
}

function GoogleGLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function ReviewCard({ review, isGoogle, googleReviewUrl }) {
  const stars = Math.max(1, Math.min(5, review.rating || 5));
  const card = (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 1px 6px rgba(0,0,0,.05)', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(n => (
            <svg key={n} width={15} height={15} viewBox="0 0 24 24" fill={n <= stars ? '#f59e0b' : '#e0e0e0'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          ))}
        </div>
        {isGoogle && <GoogleGLogo size={15} />}
      </div>
      {review.text && (
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.75, margin: 0, fontStyle: 'italic', flex: 1 }}>"{review.text}"</p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {review.photoUrl
            ? <img src={review.photoUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${G}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: G, flexShrink: 0 }}>
                {(review.name || '?')[0].toUpperCase()}
              </div>
          }
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0e1c14' }}>{review.name || 'Anonymous'}</div>
            {review.techName && <div style={{ fontSize: 11, color: G }}>with {review.techName}</div>}
          </div>
        </div>
        {review.date && <div style={{ fontSize: 11, color: '#a0aec0', flexShrink: 0 }}>{review.date}</div>}
      </div>
    </div>
  );

  const href = review.authorUrl || googleReviewUrl;
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>{card}</a>
    : card;
}

function ContactBlock({ icon, label, children, light }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2, color: G }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: light ? '#7fc8a6' : '#9ca3af', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
        {children}
      </div>
    </div>
  );
}
