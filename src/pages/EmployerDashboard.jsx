import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react'
import { employerApi } from '../services/api.js'

const STATUS_STYLE = {
  active:  { bg: 'rgba(22,163,74,0.1)',  color: '#15803D', label: 'نشط' },
  draft:   { bg: 'rgba(234,179,8,0.1)', color: '#B45309', label: 'مسودة' },
  expired: { bg: 'rgba(156,163,175,0.1)', color: '#6B7280', label: 'منتهي' },
}

const BLANK = {
  title: '', company: '', location: '', description: '',
  requirements: '', category: 'tech', job_type: 'full_time',
  experience_level: 'mid', salary_min: '', salary_max: '',
  apply_url: '', post_status: 'active',
}

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
  border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
  outline: 'none', background: 'var(--white)', color: 'var(--g950)',
  boxSizing: 'border-box',
}

export default function EmployerDashboard() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(BLANK)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')
  const [errors, setErrors]     = useState({})

  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    employerApi.getJobs()
      .then(r => setJobs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function validate() {
    const e = {}
    if (!form.title.trim())       e.title = 'المسمى مطلوب'
    if (!form.company.trim())     e.company = 'اسم الشركة مطلوب'
    if (!form.location.trim())    e.location = 'الموقع مطلوب'
    if (!form.description.trim()) e.description = 'الوصف مطلوب'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setErrors({})
    try {
      const r = await employerApi.createJob(form)
      setJobs(prev => [r.data, ...prev])
      setForm(BLANK); setShowForm(false)
      setToast('تم نشر الوظيفة بنجاح ✓')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setErrors({ server: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await employerApi.deleteJob(id).catch(() => {})
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--g900)', color: '#fff', padding: '10px 24px', borderRadius: 50,
          fontSize: 14, fontWeight: 600, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 4 }}>لوحة صاحب العمل</h1>
          <p style={{ color: 'var(--gray400)', fontSize: 14 }}>{jobs.length} وظيفة منشورة</p>
        </div>
        {isAuth && (
          <button onClick={() => setShowForm(s => !s)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', background: 'var(--g900)', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-ar)',
          }}>
            <Plus size={16} /> {showForm ? 'إلغاء' : 'نشر وظيفة'}
          </button>
        )}
      </div>

      {!isAuth && (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)',
          borderRadius: 16, padding: '32px 24px', textAlign: 'center', color: 'var(--g700)' }}>
          يتطلب تسجيل الدخول كصاحب عمل
        </div>
      )}

      {/* Create form */}
      {isAuth && showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--white)',
          border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: 'var(--g950)' }}>بيانات الوظيفة</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[
              { k: 'title',    label: 'المسمى الوظيفي *', ph: 'مثال: مطور Full Stack' },
              { k: 'company',  label: 'اسم الشركة *',      ph: 'مثال: أرامكو' },
              { k: 'location', label: 'الموقع *',           ph: 'مثال: الرياض' },
              { k: 'apply_url', label: 'رابط التقديم',      ph: 'https://...' },
            ].map(({ k, label, ph }) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>{label}</label>
                <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                  style={{ ...inputStyle, borderColor: errors[k] ? '#DC2626' : 'var(--gray200)' }} />
                {errors[k] && <p style={{ color: '#DC2626', fontSize: 11, marginTop: 3 }}>{errors[k]}</p>}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>التصنيف</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {['tech','finance','energy','construction','hr','marketing','healthcare','education','other'].map(c =>
                  <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>نوع الوظيفة</label>
              <select value={form.job_type} onChange={e => set('job_type', e.target.value)} style={inputStyle}>
                {[['full_time','دوام كامل'],['part_time','دوام جزئي'],['contract','عقد'],['freelance','مستقل'],['internship','تدريب']].map(([v,l]) =>
                  <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>مستوى الخبرة</label>
              <select value={form.experience_level} onChange={e => set('experience_level', e.target.value)} style={inputStyle}>
                {[['entry','مبتدئ'],['mid','متوسط'],['senior','خبير'],['lead','قائد'],['executive','تنفيذي']].map(([v,l]) =>
                  <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>الوصف الوظيفي *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
              style={{ ...inputStyle, resize: 'vertical', borderColor: errors.description ? '#DC2626' : 'var(--gray200)' }} />
            {errors.description && <p style={{ color: '#DC2626', fontSize: 11, marginTop: 3 }}>{errors.description}</p>}
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            {[['salary_min','الراتب الأدنى (ر.س)'],['salary_max','الراتب الأقصى (ر.س)']].map(([k, label]) => (
              <div key={k} style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>{label}</label>
                <input type="number" value={form[k]} onChange={e => set(k, e.target.value)} style={inputStyle} />
              </div>
            ))}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>الحالة</label>
              <select value={form.post_status} onChange={e => set('post_status', e.target.value)} style={inputStyle}>
                <option value="active">نشط</option>
                <option value="draft">مسودة</option>
              </select>
            </div>
          </div>

          {errors.server && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{errors.server}</p>}

          <button type="submit" disabled={saving} style={{
            padding: '11px 32px', background: 'var(--g900)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            fontFamily: 'var(--font-ar)',
          }}>{saving ? 'جاري النشر…' : 'نشر الوظيفة'}</button>
        </form>
      )}

      {/* Jobs list */}
      {isAuth && loading && (
        <div style={{ color: 'var(--gray400)', textAlign: 'center', padding: 48 }}>جاري التحميل…</div>
      )}
      {isAuth && !loading && jobs.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 64 }}>لم تنشر أي وظيفة بعد</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {jobs.map(job => {
          const s = STATUS_STYLE[job.post_status] || STATUS_STYLE.active
          return (
            <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12, background: 'var(--white)',
              border: '1.5px solid var(--gray200)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--g950)' }}>{job.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 3 }}>{job.location} — {job.created_at?.slice(0,10)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 50,
                  background: s.bg, color: s.color }}>{s.label}</span>
                <button onClick={() => handleDelete(job.id)} style={{ background: 'none', border: 'none',
                  cursor: 'pointer', color: '#DC2626', padding: 4 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
