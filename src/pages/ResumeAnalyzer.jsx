import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { UploadCloud, XCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'https://saudicareers.site/api'

/* ── Progress Bar ──────────────────────────── */
function ProgressBar({ percent }) {
  return (
    <div style={{ maxWidth:360, margin:'40px auto', textAlign:'center' }}>
      <div style={{ fontSize:14, color:'var(--gray600)', marginBottom:16 }}>
        {percent < 100 ? `جارٍ رفع الملف... ${percent}٪` : 'جارٍ تحليل السيرة...'}
      </div>
      <div style={{ background:'var(--gray200)', borderRadius:50, height:8, overflow:'hidden' }}>
        <div style={{
          height:'100%', borderRadius:50,
          background:'linear-gradient(90deg, var(--g700), var(--g500))',
          width:`${percent}%`, transition:'width 0.3s ease',
        }} />
      </div>
      {percent === 100 && (
        <div style={{ fontSize:13, color:'var(--gray400)', marginTop:12 }}>
          يستغرق التحليل بضع ثوانٍ...
        </div>
      )}
    </div>
  )
}

/* ── Upload Zone ───────────────────────────── */
function UploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false)
  const input = useRef(null)

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file?.type === 'application/pdf') onFile(file)
  }

  return (
    <div
      onClick={() => input.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        maxWidth:460, margin:'0 auto',
        border: `2px dashed ${dragging ? 'var(--g500)' : 'var(--gray300)'}`,
        borderRadius:'var(--r-xl)', padding:'48px 32px',
        textAlign:'center', cursor:'pointer',
        background: dragging ? 'var(--g50)' : 'var(--gray50)',
        transition:'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background='var(--g50)'}
      onMouseLeave={e => !dragging && (e.currentTarget.style.background='var(--gray50)')}
    >
      <input ref={input} type="file" accept=".pdf" style={{ display:'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <UploadCloud size={40} color="var(--g600)" style={{ marginBottom:16 }} />
      <div style={{ fontSize:16, fontWeight:600, color:'var(--g900)', marginBottom:8 }}>
        اسحب ملف PDF هنا أو اضغط للاختيار
      </div>
      <div style={{ fontSize:13, color:'var(--gray500)' }}>
        PDF فقط · الحد الأقصى 2MB
      </div>
    </div>
  )
}

const CONSENT_VERSION = '1.0'

/* ── Main Page ─────────────────────────────── */
export default function ResumeAnalyzer() {
  const [phase, setPhase]       = useState('idle')  // idle | uploading | error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [consent, setConsent]   = useState(false)
  const navigate = useNavigate()

  const handleFile = file => {
    if (!consent) return  // guard: لا يُمكن الوصول هنا إلا بعد الموافقة
    setPhase('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('consent', '1')
    formData.append('consent_version', CONSENT_VERSION)
    formData.append('consent_at', new Date().toISOString())

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/v1/resume/analyze`)
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status === 200) {
          // حفظ النتيجة مؤقتاً والانتقال للوحة النتائج
          const id = Date.now().toString(36)
          try { localStorage.setItem(`resume_result_${id}`, JSON.stringify(res)) } catch (_) {}

          // ── Conversion tracking ──────────────────────────────────────
          // GTM dataLayer event — يُربط بـ GA4 Conversion أو Facebook Pixel
          // من GTM: اصنع Trigger بـ Custom Event = "resume_analyzed"
          try {
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({
              event:          'resume_analyzed',
              event_category: 'engagement',
              event_label:    'cv_upload_success',
              score:          res?.score ?? null,   // درجة الـ ATS إن وُجدت
            })
          } catch (_) {}

          navigate(`/resume-results/${id}`)
        } else if (xhr.status === 422) {
          const messages = res.errors?.file?.[0] || res.message || 'الملف غير صالح'
          setErrorMsg(messages)
          setPhase('error')
        } else if (xhr.status === 429) {
          setErrorMsg('وصلت للحد الأقصى — انتظر دقيقة ثم حاول مجدداً')
          setPhase('error')
        } else {
          setErrorMsg(res.message || 'فشل التحليل، يرجى المحاولة مجدداً')
          setPhase('error')
        }
      } catch {
        setErrorMsg('حدث خطأ غير متوقع')
        setPhase('error')
      }
    }

    xhr.onerror = () => {
      setErrorMsg('فشل الاتصال بالخادم — تحقق من الإنترنت')
      setPhase('error')
    }

    xhr.send(formData)
  }

  const reset = () => {
    setPhase('idle')
    setProgress(0)
    setErrorMsg('')
  }

  return (
    <>
      <Helmet>
        <title>افحص سيرتك ضد ATS مجاناً | سعودي كارييرز</title>
        <meta name="description" content="ارفع سيرتك الذاتية واحصل على تقرير فوري عن مدى توافقها مع أنظمة الفرز الآلي ATS المستخدمة في كبرى الشركات السعودية." />
      </Helmet>

      <div style={{
        minHeight:'100vh',
        padding:'120px clamp(1rem,4vw,3rem) 80px',
        background:'linear-gradient(180deg, var(--g50) 0%, var(--white) 50%)',
      }}>
        {/* Header */}
        <div style={{ maxWidth:640, margin:'0 auto 48px', textAlign:'center' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6,
            fontSize:13, color:'var(--gray500)', textDecoration:'none', marginBottom:24,
            transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--g800)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--gray500)'}>
            <ArrowLeft size={14} /> العودة للرئيسية
          </Link>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--gold100)', color:'var(--gold700)',
            border:'1px solid rgba(197,160,89,0.3)', padding:'5px 18px',
            borderRadius:50, fontSize:12, fontWeight:700, marginBottom:20 }}>
            مجاناً تماماً — لا يلزم تسجيل
          </div>

          <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:700,
            color:'var(--g950)', lineHeight:1.2, marginBottom:16 }}>
            اختبر سيرتك ضد<br />
            <span style={{ color:'var(--g600)' }}>أنظمة ATS</span> مجاناً
          </h1>
          <p style={{ fontSize:15, color:'var(--gray600)', lineHeight:1.85, maxWidth:480, margin:'0 auto' }}>
            ٧٥٪ من السير الذاتية تُرفض آلياً قبل أن يقرأها بشر.
            اعرف موقفك الآن واحصل على توصيات فورية.
          </p>
        </div>

        {/* Content */}
        {phase === 'idle' && (
          <>
            {/* ── PDPL Consent Block ── */}
            <div style={{ maxWidth:460, margin:'0 auto 20px' }}>
              <label style={{
                display:'flex', alignItems:'flex-start', gap:12,
                cursor:'pointer',
                background: consent ? 'var(--g50)' : 'var(--gray50)',
                border: `1.5px solid ${consent ? 'var(--g300)' : 'var(--gray200)'}`,
                borderRadius:'var(--r-lg)', padding:'16px 18px',
                transition:'all 0.2s',
              }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  id="ai-analysis-consent"
                  style={{ marginTop:3, accentColor:'var(--g700)', width:16, height:16, flexShrink:0, cursor:'pointer' }}
                />
                <span style={{ fontSize:13, color:'var(--gray600)', lineHeight:1.75 }}>
                  أوافق على{' '}
                  <Link to="/privacy" target="_blank" style={{ color:'var(--g700)', fontWeight:600 }}>
                    سياسة الخصوصية
                  </Link>
                  {' '}وأمنح الإذن لتحليل سيرتي الذاتية آلياً.
                  {' '}<span style={{ color:'var(--gray400)' }}>
                    الملف يُحذف فور اكتمال التحليل ولا يُحفظ على خوادمنا. (PDPL v{CONSENT_VERSION})
                  </span>
                </span>
              </label>
            </div>

            {/* ── Upload Zone (disabled until consent) ── */}
            <div style={{ opacity: consent ? 1 : 0.45, transition:'opacity 0.3s', pointerEvents: consent ? 'auto' : 'none' }}>
              <UploadZone onFile={handleFile} />
            </div>
            {!consent && (
              <p style={{ textAlign:'center', fontSize:12, color:'var(--gray400)', marginTop:12 }}>
                يجب الموافقة على سياسة الخصوصية لتفعيل رفع الملف
              </p>
            )}
          </>
        )}
        {phase === 'uploading' && <ProgressBar percent={progress} />}
        {phase === 'error' && (
          <div style={{ maxWidth:460, margin:'0 auto', textAlign:'center' }}>
            <div style={{
              background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:'var(--r-xl)', padding:'24px 28px', marginBottom:16,
              display:'flex', alignItems:'center', gap:12, color:'#dc2626',
            }}>
              <XCircle size={20} style={{ flexShrink:0 }} />
              <span style={{ fontSize:14 }}>{errorMsg}</span>
            </div>
            <button onClick={reset} style={{
              background:'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:50, padding:'11px 28px',
              fontSize:14, fontWeight:600, cursor:'pointer',
            }}>
              حاول مجدداً
            </button>
          </div>
        )}
      </div>
    </>
  )
}
