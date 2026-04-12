import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  const scrollTo = (id) => {
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{
        position:'fixed', top:0, insetInline:0, zIndex:200,
        height:68, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 clamp(1rem,4vw,3rem)',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
        backdropFilter:'blur(16px)',
        borderBottom:'1px solid var(--gray200)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        transition:'all 0.3s',
      }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
          <img src="/saudi.png" alt="Saudi Careers"
            style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', background:'#000' }}
          />
          <span style={{ fontFamily:'var(--font-en)', fontWeight:700, fontSize:17, color:'var(--g900)' }}>
            Saudi<span style={{ color:'var(--gold500)' }}>Careers</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }} className="desktop-nav">
          {[['jobs','الوظائف'],['services','خدماتنا'],['tips','نصائح مهنية'],['how','كيف يعمل']].map(([id,label]) => (
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
          <Link to="/admin" style={{ fontSize:13, color:'var(--gray400)', padding:'7px 10px', borderRadius:'var(--r-sm)' }}>لوحة التحكم</Link>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => scrollTo('signup')} style={{
            background:'var(--g900)', color:'var(--white)',
            border:'none', padding:'9px 20px', borderRadius:50,
            fontSize:14, fontWeight:600, transition:'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background='var(--g700)'}
          onMouseLeave={e => e.target.style.background='var(--g900)'}>
            حسّن سيرتك مجاناً
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            display:'none', background:'none', border:'none', padding:4
          }} className="hamburger-btn" aria-label="القائمة">
            {menuOpen ? <X size={22} color="var(--g900)" /> : <Menu size={22} color="var(--g900)" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position:'fixed', top:68, insetInline:0, zIndex:199,
          background:'var(--white)', borderBottom:'1px solid var(--gray200)',
          padding:'1.5rem clamp(1rem,4vw,3rem)',
          display:'flex', flexDirection:'column', gap:6,
          boxShadow:'var(--shadow-lg)',
        }}>
          {[['jobs','الوظائف'],['services','خدماتنا'],['tips','نصائح مهنية'],['how','كيف يعمل']].map(([id,label]) => (
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
        }
      `}</style>
    </>
  )
}
