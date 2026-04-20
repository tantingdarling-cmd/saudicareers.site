import { useState, useEffect } from 'react'
import { Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { alertsApi } from '../services/api.js'

const FREQ_LABELS = { instant: 'فوري', daily: 'يومي', weekly: 'أسبوعي' }

const CATEGORIES = [
  { key: '', label: 'كل التصنيفات' },
  { key: 'tech', label: 'تقنية' },
  { key: 'finance', label: 'مالية' },
  { key: 'energy', label: 'طاقة' },
  { key: 'construction', label: 'إنشاءات' },
  { key: 'hr', label: 'موارد بشرية' },
  { key: 'marketing', label: 'تسويق' },
  { key: 'healthcare', label: 'صحة' },
  { key: 'education', label: 'تعليم' },
  { key: 'other', label: 'أخرى' },
]

const CAT_LABELS = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]))

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
  border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
  outline: 'none', background: 'var(--white)', color: 'var(--g950)',
  boxSizing: 'border-box',
}

export default function Alerts() {
  const [alerts, setAlerts]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [keyword, setKeyword]   = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [frequency, setFreq]    = useState('instant')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [successMsg, setSuccess] = useState('')

  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    // Pre-fill from FilterBar "حفظ البحث"
    const prefill = sessionStorage.getItem('alert_prefill')
    if (prefill) {
      try {
        const { q, location: loc, category: cat } = JSON.parse(prefill)
        if (q)   setKeyword(q)
        if (loc) setLocation(loc)
        if (cat) setCategory(cat)
      } catch {}
      sessionStorage.removeItem('alert_prefill')
    }

    if (!isAuth) { setLoading(false); return }
    alertsApi.getAll()
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!keyword && !location && !category) {
      setError('أدخل كلمة بحث أو موقعاً أو تصنيفاً على الأقل')
      return
    }
    setSaving(true); setError('')
    try {
      const r = await alertsApi.create({ keyword, location, category, frequency })
      setAlerts(prev => [r.data, ...prev])
      setKeyword(''); setLocation(''); setCategory('')
      setSuccess('تم إنشاء التنبيه بنجاح ✓')
      setTimeout(() => setSuccess(''), 3000)
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

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Bell size={28} color="var(--g700)" />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)' }}>تنبيهات الوظائف</h1>
      </div>
      <p style={{ color: 'var(--gray400)', marginBottom: 36, fontSize: 15 }}>
        احصل على إشعار فوري عند نشر وظيفة تطابق بحثك
      </p>

      {!isAuth ? (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', color: 'var(--g700)', fontSize: 15 }}>
          يتطلب تسجيل الدخول لاستخدام التنبيهات
        </div>
      ) : (
        <>
          {/* Create form */}
          <form onSubmit={handleCreate} style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24, marginBottom: 32, boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', marginBottom: 16 }}>+ إنشاء تنبيه جديد</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>كلمة البحث</label>
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="مثال: محاسب، مطور"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>الموقع</label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="مثال: الرياض، جدة"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>التصنيف</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>تكرار التنبيه</label>
                <select value={frequency} onChange={e => setFreq(e.target.value)} style={inputStyle}>
                  {Object.entries(FREQ_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ paddingTop: 22 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '11px 28px', background: 'var(--g900)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap' }}
                >
                  {saving ? '…' : '🔔 حفظ التنبيه'}
                </button>
              </div>
            </div>

            {error    && <p style={{ color: '#DC2626', fontSize: 12, marginTop: 10 }}>{error}</p>}
            {successMsg && <p style={{ color: 'var(--g700)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{successMsg}</p>}
          </form>

          {/* Alert list */}
          {loading && (
            <div style={{ color: 'var(--gray400)', textAlign: 'center', padding: 40 }}>جارٍ التحميل…</div>
          )}
          {!loading && alerts.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 48, background: 'var(--white)', borderRadius: 16, border: '1.5px solid var(--gray200)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <p style={{ fontSize: 15 }}>لا توجد تنبيهات بعد — أنشئ أول تنبيه لك</p>
            </div>
          )}

          {alerts.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--g700)', marginBottom: 12 }}>تنبيهاتك ({alerts.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 12, padding: '14px 18px', opacity: alert.active ? 1 : 0.55, transition: 'opacity 0.2s' }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--g950)' }}>
                        {alert.keyword || 'أي وظيفة'}
                      </span>
                      {alert.location && (
                        <span style={{ fontSize: 12, color: 'var(--gray600)' }}>📍 {alert.location}</span>
                      )}
                      {alert.category && (
                        <span style={{ fontSize: 11, background: 'var(--g50)', color: 'var(--g700)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--g200)' }}>
                          {CAT_LABELS[alert.category] || alert.category}
                        </span>
                      )}
                      <span style={{ fontSize: 11, background: 'var(--gold100)', color: 'var(--gold700)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--gold300)' }}>
                        {FREQ_LABELS[alert.frequency]}
                      </span>
                      {!alert.active && (
                        <span style={{ fontSize: 11, color: 'var(--gray400)' }}>متوقف</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(alert)}
                        title={alert.active ? 'إيقاف التنبيه' : 'تفعيل التنبيه'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: alert.active ? 'var(--g700)' : 'var(--gray400)', display: 'flex' }}
                      >
                        {alert.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        title="حذف التنبيه"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#DC2626', display: 'flex' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
