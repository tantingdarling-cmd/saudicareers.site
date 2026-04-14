import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { applicationsApi } from '../services/api'

export default function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ name:'', email:'', phone:'' })
  const [cvFile, setCvFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('الرجاء إدخال اسمك')
      return
    }
    if (!form.email.includes('@')) {
      setError('الرجاء إدخال بريد إلكتروني صحيح')
      return
    }
    if (cvFile && cvFile.size > 5 * 1024 * 1024) {
      setError('حجم الملف يجب أن لا يتجاوز 5 ميغابايت')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = new FormData()
      payload.append('job_id', job.id)
      payload.append('name', form.name)
      payload.append('email', form.email)
      payload.append('phone', form.phone || '')
      if (cvFile) payload.append('cv', cvFile)

      await applicationsApi.submit(payload)
      setSubmitted(true)
      setTimeout(onClose, 2200)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:500,
        background:'rgba(0,26,13,0.75)', backdropFilter:'blur(5px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1rem', animation:'fadeIn 0.2s ease',
      }}>
      <div style={{
        background:'var(--white)', borderRadius:'var(--r-xl)',
        width:'100%', maxWidth:480,
        padding:'clamp(24px,4vw,36px)',
        boxShadow:'var(--shadow-lg)', position:'relative',
        animation:'slideUp 0.3s ease',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, left:16,
          width:32, height:32, borderRadius:'50%',
          background:'var(--gray100)', border:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--gray600)', transition:'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--gray200)'}
        onMouseLeave={e => e.currentTarget.style.background='var(--gray100)'}>
          <X size={16} />
        </button>

        {!submitted ? (
          <>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>تقديم الطلب</div>
            <div style={{ fontSize:14, color:'var(--gray400)', marginBottom:22 }}>أدخل بياناتك وسنتواصل معك مباشرة</div>

            {/* Job preview */}
            <div style={{
              background:'var(--g50)', border:'1px solid var(--g100)',
              borderRadius:'var(--r-md)', padding:16, marginBottom:24,
            }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--g900)' }}>{job?.title}</div>
              <div style={{ fontSize:13, color:'var(--g600)', marginTop:4 }}>{job?.company} · {job?.location}</div>
            </div>

            {/* Form */}
            {[
              { key:'name', placeholder:'اسمك الكريم', type:'text' },
              { key:'email', placeholder:'بريدك الإلكتروني', type:'email' },
              { key:'phone', placeholder:'رقم الجوال (اختياري)', type:'tel', dir:'ltr' },
            ].map(({ key, placeholder, type, dir }) => (
              <input key={key} type={type} placeholder={placeholder}
                value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                style={{
                  width:'100%', padding:'13px 18px', marginBottom:12,
                  border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)',
                  fontSize:15, fontFamily:'var(--font-ar)',
                  color:'var(--gray800)', background:'var(--gray50)',
                  outline:'none', textAlign: dir ? 'left' : 'right',
                  direction: dir || 'rtl',
                }}
                onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
                onBlur={e => { e.target.style.borderColor='var(--gray200)'; e.target.style.background='var(--gray50)' }}
              />
            ))}

            {/* CV Upload */}
            <div style={{ marginBottom:12 }}>
              <label style={{
                display:'block', padding:'12px 18px',
                border:'1.5px dashed var(--gray200)', borderRadius:'var(--r-md)',
                background:'var(--gray50)', cursor:'pointer', textAlign:'right',
                fontSize:14, color: cvFile ? 'var(--g700)' : 'var(--gray400)',
              }}>
                {cvFile ? `✓ ${cvFile.name}` : 'رفع السيرة الذاتية (PDF/DOC — اختياري)'}
                <input
                  type="file" accept=".pdf,.doc,.docx"
                  onChange={e => setCvFile(e.target.files[0] || null)}
                  style={{ display:'none' }}
                />
              </label>
            </div>

            <button onClick={handleSubmit} disabled={loading} style={{
              width:'100%', padding:14, marginTop:4,
              background: loading ? 'var(--g600)' : 'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:600, transition:'all 0.2s',
            }}>
              {loading ? '...جارٍ الإرسال' : 'تأكيد التقديم النهائي ←'}
            </button>
            {error && <p style={{ fontSize:12, color:'#E24B4A', textAlign:'center', marginTop:8 }}>{error}</p>}
            <p style={{ fontSize:12, color:'var(--gray400)', textAlign:'center', marginTop:12 }}>
              بياناتك ستُشارك مع جهة العمل المعنية فقط
            </p>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <CheckCircle size={56} color="var(--g600)" style={{ margin:'0 auto 16px' }} />
            <div style={{ fontSize:20, fontWeight:700, color:'var(--g950)', marginBottom:8 }}>تم إرسال طلبك!</div>
            <div style={{ fontSize:14, color:'var(--gray600)', lineHeight:1.8 }}>
              سنراجع طلبك ونتواصل معك قريباً على بريدك الإلكتروني
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
