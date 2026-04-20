import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { api } from '../services/api.js'

function relTime(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 60)  return `منذ ${m || 1} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24)  return `منذ ${h} ساعة`
  return `منذ ${Math.floor(h / 24)} يوم`
}

export default function Notifications() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    api.get('/v1/notifications')
      .then(r => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function markAllRead() {
    setMarking(true)
    try {
      await api.patch('/v1/notifications/read-all', {})
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    } catch {}
    finally { setMarking(false) }
  }

  async function markOne(id) {
    try {
      await api.patch(`/v1/notifications/${id}/read`, {})
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    } catch {}
  }

  const unreadCount = items.filter(n => !n.read_at).length

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={28} color="var(--g700)" />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 2 }}>الإشعارات</h1>
            {unreadCount > 0 && (
              <p style={{ fontSize: 13, color: 'var(--gray600)' }}>{unreadCount} إشعار غير مقروء</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--g50)', color: 'var(--g700)', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ar)', opacity: marking ? 0.7 : 1 }}
          >
            <CheckCheck size={15} /> تعيين الكل كمقروء
          </button>
        )}
      </div>

      {!isAuth && (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', color: 'var(--g700)', fontSize: 15 }}>
          يتطلب تسجيل الدخول لعرض الإشعارات
        </div>
      )}

      {isAuth && loading && (
        <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 48, fontSize: 14 }}>جارٍ التحميل…</div>
      )}

      {isAuth && !loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 16, border: '1.5px solid var(--gray200)' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 8 }}>لا توجد إشعارات بعد</h2>
          <p style={{ color: 'var(--gray400)', fontSize: 14, marginBottom: 24 }}>أنشئ تنبيهات للوظائف لتتلقى إشعارات فورية</p>
          <Link to="/alerts" style={{ background: 'var(--g900)', color: '#fff', padding: '11px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            إنشاء تنبيه ←
          </Link>
        </div>
      )}

      {isAuth && !loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(n => (
            <div
              key={n.id}
              style={{ background: n.read_at ? '#fff' : 'var(--g50)', border: `1.5px solid ${n.read_at ? 'var(--gray200)' : 'var(--g200)'}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s' }}
            >
              <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>📋</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/jobs/${n.job_id}`}
                  onClick={() => { if (!n.read_at) markOne(n.id) }}
                  style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', textDecoration: 'none', display: 'block', marginBottom: 4 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--g600)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--g900)'}
                >
                  {n.job_title}
                </Link>
                {n.company && <p style={{ fontSize: 13, color: 'var(--gray600)', marginBottom: 2 }}>🏢 {n.company}</p>}
                {n.location && <p style={{ fontSize: 13, color: 'var(--gray600)', marginBottom: 2 }}>📍 {n.location}</p>}
                {n.alert_keyword && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'var(--g100)', color: 'var(--g800)', padding: '2px 8px', borderRadius: 20, marginTop: 4 }}>
                    🔔 تنبيه: {n.alert_keyword}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--gray400)' }}>{relTime(n.created_at)}</span>
                {!n.read_at && (
                  <button
                    onClick={() => markOne(n.id)}
                    style={{ fontSize: 11, color: 'var(--g600)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ar)', fontWeight: 600, padding: 0 }}
                  >
                    تعيين كمقروء
                  </button>
                )}
                {n.read_at && (
                  <span style={{ fontSize: 11, color: 'var(--gray400)' }}>✓ مقروء</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
