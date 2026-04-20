import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api.js'

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('يرجى تعبئة جميع الحقول'); return
    }
    if (form.password !== form.password_confirmation) {
      setError('كلمتا المرور غير متطابقتين'); return
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return
    }
    setLoading(true); setError('')
    try {
      await authApi.register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 15,
    border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)',
    boxSizing: 'border-box', direction: 'rtl',
  }

  const fields = [
    { key: 'name',                  label: 'الاسم الكامل',    type: 'text',     placeholder: 'محمد العمري',         auto: 'name' },
    { key: 'email',                 label: 'البريد الإلكتروني', type: 'email',   placeholder: 'example@email.com',   auto: 'email' },
    { key: 'password',              label: 'كلمة المرور',      type: 'password', placeholder: '••••••••',            auto: 'new-password' },
    { key: 'password_confirmation', label: 'تأكيد كلمة المرور', type: 'password', placeholder: '••••••••',          auto: 'new-password' },
  ]

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 24px 64px', direction: 'rtl' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g50)',
            border: '1.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 22 }}>✦</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>إنشاء حساب جديد</h1>
          <p style={{ fontSize: 14, color: 'var(--gray400)' }}>انضم لآلاف الباحثين عن عمل في السوق السعودي</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)',
          border: '1.5px solid var(--gray200)', borderRadius: 20, padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,61,43,0.06)' }}>

          {fields.map(({ key, label, type, placeholder, auto }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                autoComplete={auto}
                style={inp}
                onFocus={e => e.target.style.borderColor = 'var(--g600)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray200)'}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, textAlign: 'center',
              background: 'rgba(220,38,38,0.06)', borderRadius: 8, padding: '8px 12px' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px 0', marginTop: 4,
            background: loading ? 'var(--g400)' : 'var(--g900)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ar)', transition: 'background 0.2s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--g800)' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--g900)' }}
          >
            {loading ? 'جاري الإنشاء…' : 'إنشاء الحساب'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray400)', marginTop: 20 }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/login" style={{ color: 'var(--g700)', fontWeight: 600, textDecoration: 'none' }}>
              تسجيل الدخول
            </Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray300)', marginTop: 16 }}>
          بالتسجيل توافق على{' '}
          <Link to="/terms" style={{ color: 'var(--g600)', textDecoration: 'none' }}>شروط الاستخدام</Link>
          {' '}و{' '}
          <Link to="/privacy" style={{ color: 'var(--g600)', textDecoration: 'none' }}>سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}
