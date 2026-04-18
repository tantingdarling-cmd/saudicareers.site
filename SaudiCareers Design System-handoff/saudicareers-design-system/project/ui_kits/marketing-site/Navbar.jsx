// Navbar.jsx — glass RTL nav
const { useState, useEffect } = React;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const linkStyle = {
    fontSize: 14, fontWeight: 500, color: 'var(--gray600)',
    padding: '7px 14px', borderRadius: 'var(--r-sm)',
    border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  };
  return (
    <nav style={{
      position: 'fixed', top: 0, insetInline: 0, zIndex: 200,
      height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(1rem,4vw,3rem)',
      background: scrolled ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(15px) saturate(180%)',
      WebkitBackdropFilter: 'blur(15px) saturate(180%)',
      borderBottom: '1px solid var(--gray200)',
      boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      transition: 'all 0.3s',
    }}>
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="../../assets/saudi-logo.png" alt="SaudiCareers" style={{
          width: 46, height: 46, borderRadius: '50%', objectFit: 'cover',
          boxShadow: '0 2px 8px rgba(0,61,43,0.15)',
        }} />
        <span style={{ fontFamily: 'var(--font-en)', fontWeight: 700, fontSize: 17, color: 'var(--g900)' }}>
          Saudi<span style={{ color: 'var(--gold500)' }}>Careers</span>
        </span>
      </a>
      <div style={{ display: 'flex', gap: 4 }} className="sc-desk">
        {[['jobs', 'الوظائف'], ['services', 'خدماتنا'], ['tips', 'نصائح مهنية'], ['how', 'كيف يعمل']].map(([id, label]) => (
          <button key={id} style={linkStyle}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            onMouseEnter={e => { e.target.style.background = 'var(--g50)'; e.target.style.color = 'var(--g800)'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gray600)'; }}>
            {label}
          </button>
        ))}
      </div>
      <a href="#" style={{
        background: 'var(--gold500)', color: 'var(--g950)',
        padding: '9px 20px', borderRadius: 50,
        fontSize: 14, fontWeight: 700, textDecoration: 'none',
      }}>افحص سيرتك مجاناً ✦</a>
    </nav>
  );
}

window.Navbar = Navbar;
