import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setStatus({ type: 'success', msg: 'تم إرسال رسالتك بنجاح. سنرد عليك خلال 24 ساعة.' })
      setForm({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  const inpStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14,
    border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)',
    boxSizing: 'border-box', marginBottom: 16,
  }

  return (
    <div style={{ minHeight: '80vh', padding: '100px 24px 64px', direction: 'rtl' }}>
      <Helmet>
        <title>اتصل بنا | سعودي كارييرز</title>
        <meta name="description" content="تواصل مع فريق منصة سعودي كارييرز لأي استفسار أو دعم تقني." />
      </Helmet>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: 'var(--g950)', marginBottom: 16 }}>تواصل معنا</h1>
          <p style={{ fontSize: 16, color: 'var(--gray600)', maxWidth: 600, margin: '0 auto' }}>نحن هنا لمساعدتك في رحلتك المهنية. سواء كان لديك سؤال تقني أو اقتراح، لا تتردد في مراسلتنا.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
          {/* Contact Info */}
          <div>
            <div style={{ background: 'var(--g50)', borderRadius: 24, padding: 32, border: '1.5px solid var(--g100)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--g900)', marginBottom: 24 }}>معلومات التواصل</h2>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <Mail size={20} color="var(--g700)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray400)', marginBottom: 2 }}>البريد الإلكتروني</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g950)' }}>hello@saudicareers.site</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <MessageSquare size={20} color="var(--g700)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray400)', marginBottom: 2 }}>الدعم الفني</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g950)' }}>متاح 24/7 عبر الموقع</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  <MapPin size={20} color="var(--g700)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray400)', marginBottom: 2 }}>المقر الرئيسي</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g950)' }}>الرياض، المملكة العربية السعودية</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 24, padding: 32, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 8 }}>الاسم</label>
                <input type="text" required style={inpStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 8 }}>البريد الإلكتروني</label>
                <input type="email" required style={inpStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 8 }}>الموضوع</label>
            <input type="text" required style={inpStyle} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />

            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 8 }}>الرسالة</label>
            <textarea required rows={5} style={{ ...inpStyle, height: 'auto', resize: 'none' }} value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>

            {status.msg && (
              <div style={{ padding: '12px 16px', borderRadius: 12, background: status.type === 'success' ? 'var(--g50)' : '#FEF2F2', color: status.type === 'success' ? 'var(--g700)' : '#B91C1C', fontSize: 14, marginBottom: 20, border: '1px solid currentColor' }}>
                {status.msg}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: 'var(--g900)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'var(--g800)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--g900)'}>
              {loading ? 'جاري الإرسال...' : <><Send size={18} /> إرسال الرسالة</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
