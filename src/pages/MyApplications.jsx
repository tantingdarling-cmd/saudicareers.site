import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationsApi } from '../services/api.js'

const STATUS_STYLES = {
  pending:   { bg: 'rgba(234,179,8,0.1)',   color: '#B45309', label: 'قيد المراجعة' },
  reviewed:  { bg: 'rgba(59,130,246,0.1)',  color: '#1D4ED8', label: 'تمت المراجعة' },
  interview: { bg: 'rgba(139,92,246,0.1)',  color: '#6D28D9', label: 'مقابلة' },
  accepted:  { bg: 'rgba(22,163,74,0.1)',   color: '#15803D', label: 'مقبول' },
  rejected:  { bg: 'rgba(220,38,38,0.1)',   color: '#B91C1C', label: 'مرفوض' },
  withdrawn: { bg: 'rgba(156,163,175,0.1)', color: '#6B7280', label: 'منسحب' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 50,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

export default function MyApplications() {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    applicationsApi.my()
      .then(r => setApps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>
        طلباتي
      </h1>
      <p style={{ color: 'var(--gray400)', marginBottom: 36 }}>{apps.length} طلب</p>

      {!isAuth && (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)',
          borderRadius: 16, padding: '32px 24px', textAlign: 'center', color: 'var(--g700)' }}>
          يتطلب تسجيل الدخول لعرض طلباتك
        </div>
      )}

      {isAuth && loading && (
        <div style={{ color: 'var(--gray400)', textAlign: 'center', padding: 48 }}>جاري التحميل…</div>
      )}

      {isAuth && !loading && apps.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 64 }}>
          لم تقدّم على أي وظيفة بعد
          <br />
          <Link to="/" style={{ color: 'var(--g700)', fontWeight: 600, fontSize: 14, marginTop: 12, display: 'inline-block' }}>
            استعرض الوظائف →
          </Link>
        </div>
      )}

      {isAuth && !loading && apps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {apps.map(app => (
            <div key={app.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12,
              background: 'var(--white)', border: '1.5px solid var(--gray200)',
              borderRadius: 14, padding: '16px 20px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--g950)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {app.job_title || 'وظيفة محذوفة'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 3 }}>
                  {app.company} — {app.applied_at}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={app.status} />
                {app.tracking_token && (
                  <Link to={`/track/${app.tracking_token}`}
                    style={{ fontSize: 12, color: 'var(--g600)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    تتبع ←
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
