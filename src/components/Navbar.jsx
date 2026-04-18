import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const scrollTo = (id) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position:'fixed', top:0, insetInline:0, zIndex:200,
        height:68, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 clamp(1rem,4vw,3rem)',
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.75)',
        backdropFilter:'blur(18px) saturate(200%)',
        borderBottom: scrolled ? '1px solid var(--gray200)' : '1px solid rgba(217,226,220,0.5)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        transition:'all 0.35s var(--ease-expo)',
      }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <picture>
            <source srcSet="/saudi.webp" type="image/webp" />
            <img src="/saudi.png" alt="Saudi Careers" fetchPriority="high" decoding="async"
              style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', background:'#000' }}
            />
          </picture>
          <span style={{ fontFamily:'var(--font-en)', fontWeight:700, fontSize:17, color:'var(--g900)' }}>
            Saudi<span style={{ color:'var(--gold500)' }}>Careers</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }} className="desktop-nav">
          {[['jobs','الوظائف'],['services','خدماتنا'],['how','كيف يعمل']].map(([id,label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              fontSize:14, fontWeight:500, color:'var(--gray600)',
              padding:'7px 14px', borderRadius:'var(--r-sm)',
              border:'none', background:'transparent', cursor:'pointer',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background='var(--g50)'; e.target.style.color='var(--g800)' }}
            onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='var(--gray600)' }}>
              {label}
            </button>
          ))}
          <Link to="/tips" style={{
            fontSize:14, fontWeight:500, color:'var(--gray600)',
            padding:'7px 14px', borderRadius:'var(--r-sm)',
            textDecoration:'none', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--g50)'; e.currentTarget.style.color='var(--g800)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray600)' }}>
            نصائح
          </Link>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Link to="/resume-analyzer" className="resume-cta-desktop" style={{
            background:'linear-gradient(135deg,var(--g900) 0%,var(--g700) 100%)',
            color:'var(--white)',
            padding:'9px 20px', borderRadius:50,
            fontSize:14, fontWeight:700, textDecoration:'none',
            transition:'all 0.25s var(--ease-pop)',
            boxShadow:'0 4px 14px rgba(0,61,43,0.22)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,61,43,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 14px rgba(0,61,43,0.22)' }}
          onMouseDown={e => e.currentTarget.style.transform='translateY(0) scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform='translateY(-1px) scale(1)'}>
            افحص سيرتك مجاناً ✦
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display:'none', background:'none', border:'none', padding:8,
            borderRadius:'var(--r-sm)', minWidth:44, minHeight:44,
            alignItems:'center', justifyContent:'center',
          }} className="hamburger-btn" aria-label="القائمة">
            {menuOpen ? <X size={22} color="var(--g900)" /> : <Menu size={22} color="var(--g900)" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position:'fixed', top:68, insetInline:0, zIndex:199,
          background:'rgba(255,255,255,0.88)', backdropFilter:'blur(20px) saturate(180%)',
          borderBottom:'1px solid var(--gray200)',
          padding:'1.5rem clamp(1rem,4vw,3rem)',
          display:'flex', flexDirection:'column', gap:6,
          boxShadow:'var(--shadow-lg)',
        }}>
          {[['jobs','الوظائف'],['services','خدماتنا'],['how','كيف يعمل']].map(([id,label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              fontSize:15, fontWeight:500, color:'var(--gray600)',
              padding:'12px 16px', borderRadius:'var(--r-md)',
              border:'none', background:'transparent', textAlign:'right',
              transition:'all 0.2s', width:'100%',
            }}
            onMouseEnter={e => { e.target.style.background='var(--g50)'; e.target.style.color='var(--g800)' }}
            onMouseLeave={e => { e.target.style.background='transparent'; e.target.style.color='var(--gray600)' }}>
              {label}
            </button>
          ))}
          <Link to="/tips" onClick={() => setMenuOpen(false)} style={{
            fontSize:15, fontWeight:500, color:'var(--gray600)',
            padding:'12px 16px', borderRadius:'var(--r-md)',
            textDecoration:'none', textAlign:'right', display:'block',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--g50)'; e.currentTarget.style.color='var(--g800)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--gray600)' }}>
            نصائح
          </Link>
          <button onClick={() => scrollTo('signup')} style={{
            marginTop:8, background:'var(--g900)', color:'var(--white)',
            border:'none', padding:13, borderRadius:'var(--r-md)',
            fontSize:15, fontWeight:600, textAlign:'center',
          }}>
            حسّن سيرتك مجاناً ←
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .resume-cta-desktop { display: none !important; }
          .navbar-logo-center { justify-content: center !important; position: absolute !important; left: 50% !important; transform: translateX(-50%) !important; }
        }
        @media (min-width: 861px) {
          .navbar-logo-center { position: static !important; transform: none !important; }
        }
      `}</style>
    </>
  )
}
