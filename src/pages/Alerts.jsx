import { useState, useEffect } from 'react'
import { Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { alertsApi } from '../services/api.js'

const FREQ_LABELS = { instant: 'فوري', daily: 'يومي', weekly: 'أسبوعي' }

export default function Alerts() {
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [keyword, setKeyword]   = useState('')
  const [location, setLocation] = useState('')
  const [frequency, setFreq]    = useState('instant')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    alertsApi.getAll()
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!keyword && !location) { setError('أدخل كلمة بحث أو موقعاً على الأقل'); return }
    setSaving(true); setError('')
    try {
      const r = await alertsApi.create({ keyword, location, frequency })
      setAlerts(prev => [r.data, ...prev])
      setKeyword(''); setLocation('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await alertsApi.delete(id).catch(() => {})
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  async function handleToggle(alert) {
    const r = await alertsApi.toggle(alert.id).catch(() => null)
    if (r) setAlerts(prev => prev.map(a => a.id === alert.id ? r.data : a))
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Bell size={28} color="var(--g700)" />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)' }}>تنبيهات الوظائف</h1>
      </div>
      <p style={{ color: 'var(--gray400)', marginBottom: 36 }}>
        احصل على إشعار فوري عند نشر وظيفة تطابق بحثك
      </p>

      {!isAuth ? (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 16,
          padding: '32px 24px', textAlign: 'center', color: 'var(--g700)' }}>
          يتطلب تسجيل الدخول لاستخدام التنبيهات
        </div>
      ) : (
        <>
          {/* Create form */}
          <form onSubmit={handleCreate} style={{ background: 'var(--white)',
            border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>
                  كلمة البحث
                </label>
                <input value={keyword} onChange={e => setKeyword(e.target.value)}
                  placeholder="مثال: محاسب، مطور" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>
                  الموقع
                </label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="مثال: الرياض، جدة" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <select value={frequency} onChange={e => setFreq(e.target.value)}
                style={{ ...inputStyle, width: 'auto', flex: 1 }}>
                {Object.entries(FREQ_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <button type="submit" disabled={saving} style={{
                padding: '10px 24px', background: 'var(--g900)', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap',
              }}>
                {saving ? '…' : '+ إضافة تنبيه'}
              </button>
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 8 }}>{error}</p>}
          </form>

          {/* Alert list */}
          {loading && <div style={{ color: 'var(--gray400)', textAlign: 'center', padding: 40 }}>جاري التحميل…</div>}
          {!loading && alerts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 40 }}>لا توجد تنبيهات بعد</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--white)', border: '1.5px solid var(--gray200)',
                borderRadius: 12, padding: '14px 18px',
                opacity: alert.active ? 1 : 0.5,
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--g950)' }}>
                    {alert.keyword || 'أي وظيفة'}
                  </span>
                  {alert.location && (
                    <span style={{ fontSize: 12, color: 'var(--gray400)', marginRight: 8 }}>
                      — {alert.location}
                    </span>
                  )}
                  <span style={{ fontSize: 11, background: 'var(--g50)', color: 'var(--g700)',
                    padding: '2px 8px', borderRadius: 20, marginRight: 8 }}>
                    {FREQ_LABELS[alert.frequency]}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleToggle(alert)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: alert.active ? 'var(--g700)' : 'var(--gray400)',
                  }}>
                    {alert.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => handleDelete(alert.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: '#DC2626',
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
