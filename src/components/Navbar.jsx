import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, User, Briefcase, Heart, LogOut } from 'lucide-react'
import { api } from '../services/api.js'

function relTime(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 60)  return `منذ ${m || 1} د`
  const h = Math.floor(m / 60)
  if (h < 24)  return `منذ ${h} س`
  return `منذ ${Math.floor(h / 24)} ي`
}

function NotifBell() {
  const [count,  setCount]  = useState(0)
  const [items,  setItems]  = useState([])
  const [open,   setOpen]   = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef()
  const navigate = useNavigate()
  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) return
    fetchCount()
    const t = setInterval(fetchCount, 60000)
    return () => clearInterval(t)
  }, [isAuth])

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function fetchCount() {
    try {
      const r = await api.get('/v1/notifications/unread')
      setCount(r.count)
    } catch {}
  }

  async function handleOpen() {
    if (open) { setOpen(false); return }
    setOpen(true)
    setLoading(true)
    try {
      const r = await api.get('/v1/notifications/unread')
      setCount(r.count)
      setItems(r.data)
    } catch {}
    finally { setLoading(false) }
  }

  async function markAllRead() {
    try {
      await api.patch('/v1/notifications/read-all', {})
      setCount(0)
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    } catch {}
  }

  if (!isAuth) return null

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        aria-label="الإشعارات"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: 'none', background: open ? 'var(--g50)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <Bell size={18} color="var(--g800)" />
        {count > 0 && (
          <span style={{ position: 'absolute', top: 4, left: 4, minWidth: 16, height: 16, borderRadius: 8, background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', lineHeight: 1 }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 46, left: '50%', transform: 'translateX(-50%)', width: 320, background: '#fff', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,61,43,0.18)', border: '1px solid var(--gray200)', zIndex: 500, overflow: 'hidden', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>الإشعارات</span>
            {count > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--g600)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ar)', fontWeight: 600 }}>
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--gray400)', fontSize: 13 }}>جارٍ التحميل…</div>
            )}
            {!loading && items.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, color: 'var(--gray400)' }}>لا توجد إشعارات جديدة</p>
              </div>
            )}
            {items.map(n => (
              <Link
                key={n.id}
                to={`/jobs/${n.job_id}`}
                onClick={() => { setOpen(false); if (!n.read_at) api.patch(`/v1/notifications/${n.id}/read`, {}).catch(() => {}) }}
                style={{ display: 'block', padding: '12px 16px', textDecoration: 'none', borderBottom: '1px solid var(--gray100)', background: n.read_at ? '#fff' : 'var(--g50)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray50)'}
                onMouseLeave={e => e.currentTarget.style.background = n.read_at ? '#fff' : 'var(--g50)'}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📋</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--g900)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.job_title}</p>
                    {n.company && <p style={{ fontSize: 11, color: 'var(--gray600)', marginBottom: 2 }}>{n.company}</p>}
                    {n.alert_keyword && <p style={{ fontSize: 11, color: 'var(--g600)' }}>تنبيه: {n.alert_keyword}</p>}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--gray400)', flexShrink: 0, marginTop: 2 }}>{relTime(n.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--gray100)', textAlign: 'center' }}>
            <Link to="/notifications" onClick={() => setOpen(false)} style={{ fontSize: 13, color: 'var(--g700)', fontWeight: 600, textDecoration: 'none' }}>
              عرض كل الإشعارات ←
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const ref = useRef()
  const navigate = useNavigate()
  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    const onClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!isAuth) return
    const token = localStorage.getItem('auth_token')
    fetch('/api/v1/referral/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setReferralCount(d.count || 0))
      .catch(() => {})
  }, [isAuth])

  function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setOpen(false)
    navigate('/')
  }

  if (!isAuth) return null

  const LINKS = [
    { to: '/my-applications', icon: <Briefcase size={14}/>, label: 'طلباتي' },
    { to: '/saved',           icon: <Heart size={14}/>,     label: 'الوظائف المحفوظة' },
    { to: '/alerts',          icon: <Bell size={14}/>,      label: 'التنبيهات' },
    { to: '/profile',         icon: <User size={14}/>,      label: 'ملفي الشخصي' },
  ]

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="ملفي"
        style={{
          width:36, height:36, borderRadius:'50%', border:'none',
          background: open ? 'var(--g100)' : 'var(--g50)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', transition:'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--g100)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background='var(--g50)' }}
      >
        <User size={16} color="var(--g700)" />
      </button>

      {open && (
        <div style={{
          position:'absolute', top:44, left:'50%', transform:'translateX(-50%)',
          width:200, background:'#fff', borderRadius:14,
          boxShadow:'0 12px 40px rgba(0,61,43,0.15)', border:'1px solid var(--gray200)',
          zIndex:500, overflow:'hidden', direction:'rtl', fontFamily:'var(--font-ar)',
        }}>
          {LINKS.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'11px 16px',
                textDecoration:'none', color:'var(--g800)', fontSize:13, fontWeight:600,
                borderBottom:'1px solid var(--gray100)', transition:'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--g50)'}
              onMouseLeave={e => e.currentTarget.style.background='#fff'}
            >
              <span style={{ color:'var(--g600)' }}>{icon}</span> {label}
            </Link>
          ))}
          {referralCount > 0 && (
            <div style={{
              display:'flex', alignItems:'center', gap:8, padding:'10px 16px',
              background:'var(--g50)', borderBottom:'1px solid var(--gray100)',
              fontSize:12, fontWeight:700, color:'var(--g700)',
            }}>
              <span style={{ fontSize:15 }}>🎉</span>
              دعوت {referralCount} {referralCount === 1 ? 'صديق' : 'أصدقاء'}
            </div>
          )}
          <button
            onClick={logout}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'11px 16px', border:'none', background:'#fff',
              color:'#B91C1C', fontSize:13, fontWeight:600, cursor:'pointer',
              textAlign:'right', fontFamily:'var(--font-ar)', transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(220,38,38,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background='#fff'}
          >
            <LogOut size={14}/> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location  = useLocation()
  const isHome    = location.pathname === '/'
  const navigate  = useNavigate()

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
        position: 'fixed', top: 0, insetInline: 0, zIndex: 200,
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,4vw,3rem)',
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(18px) saturate(200%)',
        borderBottom: scrolled ? '1px solid var(--gray200)' : '1px solid rgba(217,226,220,0.5)',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        transition: 'all 0.35s var(--ease-expo)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.svg" alt="Saudi Careers" fetchPriority="high" decoding="async"
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', background: '#1B5E37' }}
          />
          <span style={{ fontFamily: 'var(--font-en)', fontWeight: 700, fontSize: 17, color: 'var(--g900)' }}>
            Saudi<span style={{ color: 'var(--gold500)' }}>Careers</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {[['jobs', 'الوظائف'], ['services', 'خدماتنا'], ['how', 'كيف يعمل']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray600)', padding: '7px 14px', borderRadius: 'var(--r-sm)', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--g50)'; e.target.style.color = 'var(--g800)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gray600)' }}>
              {label}
            </button>
          ))}
          <Link to="/tips" style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray600)', padding: '7px 14px', borderRadius: 'var(--r-sm)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--g50)'; e.currentTarget.style.color = 'var(--g800)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray600)' }}>
            نصائح
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotifBell />
          <ProfileMenu />
          {!localStorage.getItem('auth_token') && (
            <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              تسجيل الدخول
            </Link>
          )}
          <Link to={localStorage.getItem('auth_token') ? "/resume-analyzer" : "/register"} className="resume-cta-desktop" style={{ background: 'linear-gradient(135deg,var(--g900) 0%,var(--g700) 100%)', color: 'var(--white)', padding: '9px 20px', borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.25s var(--ease-pop)', boxShadow: '0 4px 14px rgba(0,61,43,0.22)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,61,43,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,61,43,0.22)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(0) scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-1px) scale(1)'}>
            {localStorage.getItem('auth_token') ? 'افحص سيرتك مجاناً ✦' : 'سجّل مجاناً'}
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', padding: 8, borderRadius: 'var(--r-sm)', minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }} className="hamburger-btn" aria-label="القائمة">
            {menuOpen ? <X size={22} color="var(--g900)" /> : <Menu size={22} color="var(--g900)" />}
          </button>
        </div>

      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, insetInline: 0, zIndex: 199, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid var(--gray200)', padding: '1.5rem clamp(1rem,4vw,3rem)', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: 'var(--shadow-lg)' }}>
          {[['jobs', 'الوظائف'], ['services', 'خدماتنا'], ['how', 'كيف يعمل']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray600)', padding: '12px 16px', borderRadius: 'var(--r-md)', border: 'none', background: 'transparent', textAlign: 'right', transition: 'all 0.2s', width: '100%' }}
              onMouseEnter={e => { e.target.style.background = 'var(--g50)'; e.target.style.color = 'var(--g800)' }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--gray600)' }}>
              {label}
            </button>
          ))}
          <Link to="/tips" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray600)', padding: '12px 16px', borderRadius: 'var(--r-md)', textDecoration: 'none', textAlign: 'right', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--g50)'; e.currentTarget.style.color = 'var(--g800)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray600)' }}>
            نصائح
          </Link>
          <Link to="/notifications" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray600)', padding: '12px 16px', borderRadius: 'var(--r-md)', textDecoration: 'none', textAlign: 'right', display: 'block' }}>
            🔔 الإشعارات
          </Link>
          <Link to="/my-applications" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray600)', padding: '12px 16px', borderRadius: 'var(--r-md)', textDecoration: 'none', textAlign: 'right', display: 'block' }}>
            📋 طلباتي
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: 'var(--gray600)', padding: '12px 16px', borderRadius: 'var(--r-md)', textDecoration: 'none', textAlign: 'right', display: 'block' }}>
            👤 ملفي الشخصي
          </Link>
          <button onClick={() => scrollTo('signup')} style={{ marginTop: 8, background: 'var(--g900)', color: 'var(--white)', border: 'none', padding: 13, borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 600, textAlign: 'center' }}>
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
