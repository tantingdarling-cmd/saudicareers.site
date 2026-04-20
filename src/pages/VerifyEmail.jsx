import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api.js'

export default function VerifyEmail() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    if (code.length !== 6) {
      setError('يرجى إدخال الكود المكون من 6 أرقام'); return
    }
    setLoading(true); setError('')
    try {
      await authApi.verifyEmail(code)
      // Update local storage user if needed, or just refresh
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.email_verified_at = new Date().toISOString()
      localStorage.setItem('user', JSON.stringify(user))
      
      navigate('/', { replace: true })
      window.location.reload() // Force update navbar etc
    } catch (err) {
      setError(err.message || 'الكود غير صحيح أو انتهت صلاحيته')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError(''); setLoading(true)
    try {
      await authApi.resendOtp()
      setResendCooldown(60)
    } catch (err) {
      setError('فشل إعادة إرسال الكود')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', padding: '14px', borderRadius: 12, fontSize: 24,
    border: '1.5px solid var(--gray200)', fontFamily: 'monospace',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)',
    boxSizing: 'border-box', textAlign: 'center', letterSpacing: '8px'
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 64px', direction: 'rtl' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--g50)', border: '1.5px solid var(--g200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✉️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>تفعيل الحساب</h1>
          <p style={{ fontSize: 14, color: 'var(--gray400)' }}>أدخل رمز التحقق المرسل إلى بريدك الإلكتروني</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 4px 24px rgba(0,61,43,0.06)' }}>
          <div style={{ marginBottom: 24 }}>
            <input
              type="text"
              maxLength="6"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={inp}
              autoFocus
            />
          </div>

          {error && (
            <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16, textAlign: 'center', background: 'rgba(220,38,38,0.06)', borderRadius: 8, padding: '8px 12px' }}>{error}</p>
          )}

          <button type="submit" disabled={loading || code.length !== 6} style={{
            width: '100%', padding: '13px 0', background: loading ? 'var(--g400)' : 'var(--g900)',
            color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ar)'
          }}>
            {loading ? 'جاري التحقق…' : 'تفعيل الحساب'}
          </button>

          <button type="button" onClick={handleResend} disabled={loading || resendCooldown > 0} style={{
            width: '100%', padding: '10px 0', marginTop: 12, background: 'none', color: resendCooldown > 0 ? 'var(--gray300)' : 'var(--g700)', border: 'none', fontSize: 13, fontWeight: 600, cursor: resendCooldown > 0 ? 'default' : 'pointer', fontFamily: 'var(--font-ar)'
          }}>
            {resendCooldown > 0 ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : 'إعادة إرسال الكود'}
          </button>
        </form>
      </div>
    </div>
  )
}
