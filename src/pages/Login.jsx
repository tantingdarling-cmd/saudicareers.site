import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/api.js'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { setError('يرجى إدخال البريد وكلمة المرور'); return }
    setLoading(true); setError('')
    try {
      await authApi.login(email, password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 15,
    border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)',
    boxSizing: 'border-box', direction: 'rtl',
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 24px 64px', direction: 'rtl' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>تسجيل الدخول</h1>
          <p style={{ fontSize: 14, color: 'var(--gray400)' }}>أدخل بياناتك للوصول إلى حسابك</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)',
          border: '1.5px solid var(--gray200)', borderRadius: 20, padding: '32px 28px' }}>

          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>
              البريد الإلكتروني
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com" style={inputStyle} autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 6 }}>
              كلمة المرور
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px 0',
            background: loading ? 'var(--g400)' : 'var(--g900)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ar)', transition: 'background 0.2s',
          }}>
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
