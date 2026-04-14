import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, CheckCircle, Upload, Loader } from 'lucide-react'
import { applicationsApi } from '../services/api'

// ── Success State Component ─────────────────────────────────────────
// يُعرض بعد إرسال الطلب بنجاح مع كشف درجة AI متحركة إن وُجدت
function SuccessState({ job, score, onClose }) {
  // double-RAF: ينتظر رسمتين متتاليتين بدلاً من setTimeout ثابت
  // الرسمة الأولى: الـ DOM ظهر / الثانية: الـ layout حُسب → آمن لبدء الـ transition
  const [ringReady, setRingReady] = useState(false)
  useEffect(() => {
    let raf1, raf2
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRingReady(true))
    })
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2) }
  }, [])

  const hasScore = score !== null && score !== undefined

  // تحديد الـ tier بناءً على الدرجة
  const tier = hasScore
    ? score >= 80
      ? { label:'مطابقة ممتازة', color:'#065F46', bg:'#D1FAE5', border:'#6EE7B7', emoji:'🏆' }
      : score >= 50
        ? { label:'مطابقة جيدة', color:'#92400E', bg:'#FEF3C7', border:'#FCD34D', emoji:'⭐' }
        : { label:'طلبك قيد المراجعة', color:'#991B1B', bg:'#FEE2E2', border:'#FCA5A5', emoji:'📋' }
    : null

  // حساب stroke-dashoffset للحلقة الدائرية (r=36 → circumference≈226)
  const CIRCUM  = 226
  const offset  = hasScore ? CIRCUM * (1 - score / 100) : CIRCUM

  return (
    <div style={{ textAlign:'center', padding:'28px 8px 20px' }}>

      {/* ── Animated checkmark ── */}
      <div style={{
        width:72, height:72, margin:'0 auto 20px',
        animation:'checkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <CheckCircle size={72} color="var(--g600)" strokeWidth={1.5} />
      </div>

      <div style={{ fontSize:21, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>
        تم إرسال طلبك!
      </div>
      <div style={{ fontSize:14, color:'var(--gray600)', lineHeight:1.8, marginBottom:hasScore ? 24 : 28 }}>
        سنراجع طلبك ونتواصل معك قريباً على بريدك الإلكتروني
      </div>

      {/* ── Score ring — يظهر فقط عند ai_consent + نتيجة ── */}
      {hasScore && tier && (
        <div style={{
          background: tier.bg,
          border: `1.5px solid ${tier.border}`,
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          marginBottom: 24,
          animation: 'scoreFadeUp 0.5s ease 0.4s both',
          display: 'flex', alignItems: 'center', gap: 20,
          textAlign: 'right',
        }}>
          {/* SVG Ring */}
          <div style={{ flexShrink:0 }}>
            <svg width="72" height="72" viewBox="0 0 80 80">
              {/* خلفية الحلقة */}
              <circle cx="40" cy="40" r="36"
                fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="7"/>
              {/* الحلقة المتحركة — تبدأ فقط بعد ringReady */}
              <circle cx="40" cy="40" r="36"
                fill="none"
                stroke={tier.color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={CIRCUM}
                strokeDashoffset={ringReady ? offset : CIRCUM}
                transform="rotate(-90 40 40)"
                style={{
                  transition: ringReady
                    ? 'stroke-dashoffset 1.2s cubic-bezier(0.19,1,0.22,1) 0.4s'
                    : 'none',
                }}
              />
              {/* النسبة المئوية في المنتصف */}
              <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
                fontSize="16" fontWeight="800" fill={tier.color}
                fontFamily="'Plus Jakarta Sans', sans-serif">
                {Math.round(score)}%
              </text>
            </svg>
          </div>
          {/* النص */}
          <div style={{ flex:1, textAlign:'right' }}>
            <div style={{ fontSize:13, color: tier.color, fontWeight:700, marginBottom:4 }}>
              {tier.emoji} {tier.label}
            </div>
            <div style={{ fontSize:12, color:'var(--gray600)', lineHeight:1.7 }}>
              {score >= 80
                ? 'طلبك يُعدّ من الطلبات المميزة وسيُراجع بأولوية عالية'
                : score >= 50
                  ? 'طلبك يوافق جزءاً من متطلبات الوظيفة — أضف تفاصيل أكثر في طلباتك القادمة'
                  : 'طلبك وصل ويخضع للمراجعة اليدوية'}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <Link
        to={`/?category=${job?.category || 'all'}#jobs`}
        onClick={onClose}
        style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'12px 28px', background:'var(--g900)',
          color:'var(--white)', borderRadius:'var(--r-md)',
          fontSize:14, fontWeight:600, textDecoration:'none',
          transition:'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--g700)'}
        onMouseLeave={e => e.currentTarget.style.background='var(--g900)'}
      >
        قدّم على وظائف مشابهة ←
      </Link>
    </div>
  )
}

// §9 / §4: Validation helpers matching StoreApplicationRequest rules
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const isValidPhone = (v) => !v || /^[\d\s\+\-\(\)]{7,20}$/.test(v.trim())

export default function ApplyModal({ job, onClose }) {
  const [form, setForm]           = useState({ name:'', email:'', phone:'' })
  const [errors, setErrors]       = useState({})   // ENHANCEMENT 2: inline field errors
  const [cvFile, setCvFile]       = useState(null)
  const [isDragging, setIsDragging] = useState(false) // ENHANCEMENT 3: drag state
  const [progress, setProgress]   = useState(0)    // ENHANCEMENT 3: upload progress 0-100
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [matchScore, setMatchScore] = useState(null)   // درجة AI المحسوبة — تُعرض في Success State
  // PDPL consent_v2 — موافقة صريحة على المعالجة بالذكاء الاصطناعي
  const [aiConsent, setAiConsent] = useState(false)

  // ENHANCEMENT 1: auto-focus name field on mount
  const nameRef = useRef(null)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    nameRef.current?.focus()
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── ENHANCEMENT 2: onBlur real-time validation ──────────────────
  const validateField = (key, value) => {
    if (key === 'name'  && !value.trim())        return 'الاسم مطلوب'
    if (key === 'email' && !isValidEmail(value)) return 'بريد إلكتروني غير صحيح'
    if (key === 'phone' && !isValidPhone(value)) return 'رقم الجوال غير صحيح'
    return ''
  }

  const handleBlur = (key) => {
    const msg = validateField(key, form[key])
    setErrors(prev => ({ ...prev, [key]: msg }))
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  // ── ENHANCEMENT 3: drag-and-drop handlers ──────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = ()  => setIsDragging(false)
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  const validateAndSetFile = (file) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setError('الملف يجب أن يكون PDF أو Word')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الملف يجب أن لا يتجاوز 5 ميغابايت')
      return
    }
    setError('')
    setCvFile(file)
  }

  // ── ENHANCEMENT 3: XHR-based submit with progress tracking ─────
  // Uses XMLHttpRequest instead of fetch so onprogress events fire.
  const handleSubmit = () => {
    // Validate all fields before submit
    const nameErr  = validateField('name',  form.name)
    const emailErr = validateField('email', form.email)
    const phoneErr = validateField('phone', form.phone)
    if (nameErr || emailErr || phoneErr) {
      setErrors({ name: nameErr, email: emailErr, phone: phoneErr })
      return
    }

    const payload = new FormData()
    payload.append('job_id',     job.id)
    payload.append('name',       form.name.trim())
    payload.append('email',      form.email.trim())
    payload.append('phone',      form.phone || '')
    payload.append('ai_consent', aiConsent ? '1' : '0')
    if (cvFile) payload.append('cv', cvFile)

    setLoading(true)
    setError('')
    setProgress(0)

    const token = localStorage.getItem('auth_token')
    const xhr   = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      setLoading(false)
      if (xhr.status === 201 || xhr.status === 200) {
        setProgress(100)
        setSubmitted(true)

        // ── GTM: High Quality Lead event ─────────────────────────────
        // يُطلق عند موافقة على AI + درجة مطابقة ≥ 80 (hql_threshold)
        try {
          const res = JSON.parse(xhr.responseText)
          const score = res?.match_score ?? null
          if (score !== null) setMatchScore(parseFloat(score))
          window.dataLayer = window.dataLayer || []
          window.dataLayer.push({
            event:          'application_submitted',
            event_category: 'conversion',
            job_id:         job.id,
            job_title:      job.title,
            ai_scored:      aiConsent,
            match_score:    score,
          })
          if (score !== null && score >= 80) {
            window.dataLayer.push({
              event:       'hql_application',
              match_score: score,
              job_id:      job.id,
            })
          }
        } catch (_) {}

      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          setError(data.message || 'حدث خطأ أثناء الإرسال')
        } catch {
          setError('حدث خطأ أثناء الإرسال')
        }
      }
    }

    xhr.onerror = () => {
      setLoading(false)
      setError('فشل الاتصال بالخادم')
    }

    const apiBase = import.meta.env.VITE_API_URL || 'https://saudicareers.site/api'
    xhr.open('POST', `${apiBase}/v1/applications`)
    xhr.setRequestHeader('Accept', 'application/json')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(payload)
  }

  // ── Input style helper ──────────────────────────────────────────
  const inputStyle = (key) => ({
    width: '100%', padding: '13px 18px', marginBottom: errors[key] ? 4 : 12,
    border: `1.5px solid ${errors[key] ? '#E24B4A' : 'var(--gray200)'}`,
    borderRadius: 'var(--r-md)', fontSize: 15,
    fontFamily: 'var(--font-ar)', color: 'var(--gray800)',
    background: 'var(--gray50)', outline: 'none',
    textAlign: 'right', direction: 'rtl',
  })

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
        animation:'slideUp 0.3s ease', maxHeight:'92vh', overflowY:'auto',
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

        {/* ── Success State — Micro-animated ─────────────────────── */}
        {submitted ? (
          <SuccessState job={job} score={matchScore} onClose={onClose} />
        ) : (
          <>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>تقديم الطلب</div>
            <div style={{ fontSize:14, color:'var(--gray400)', marginBottom:22 }}>أدخل بياناتك وسنتواصل معك مباشرة</div>

            {/* Job preview */}
            <div style={{ background:'var(--g50)', border:'1px solid var(--g100)', borderRadius:'var(--r-md)', padding:16, marginBottom:24 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--g900)' }}>{job?.title}</div>
              <div style={{ fontSize:13, color:'var(--g600)', marginTop:4 }}>{job?.company} · {job?.location}</div>
            </div>

            {/* ── ENHANCEMENT 1 + 2: Fields with ref, onBlur validation ── */}
            <input
              ref={nameRef}
              type="text"
              placeholder="اسمك الكريم *"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              style={inputStyle('name')}
              onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
            />
            {errors.name && <p style={{ fontSize:12, color:'#E24B4A', marginBottom:10, marginTop:0 }}>{errors.name}</p>}

            <input
              type="email"
              placeholder="بريدك الإلكتروني *"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              style={inputStyle('email')}
              onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
            />
            {errors.email && <p style={{ fontSize:12, color:'#E24B4A', marginBottom:10, marginTop:0 }}>{errors.email}</p>}

            <input
              type="tel"
              placeholder="رقم الجوال (اختياري)"
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              style={{ ...inputStyle('phone'), textAlign:'left', direction:'ltr' }}
              onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
            />
            {errors.phone && <p style={{ fontSize:12, color:'#E24B4A', marginBottom:10, marginTop:0 }}>{errors.phone}</p>}

            {/* ── ENHANCEMENT 3: Drag-and-drop CV upload zone ──── */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                marginBottom:12, padding:'16px 18px',
                border: `1.5px dashed ${isDragging ? 'var(--g600)' : cvFile ? 'var(--g400)' : 'var(--gray200)'}`,
                borderRadius:'var(--r-md)',
                background: isDragging ? 'var(--g50)' : cvFile ? 'rgba(0,61,43,0.03)' : 'var(--gray50)',
                transition:'all 0.2s', textAlign:'right', cursor:'pointer',
              }}
            >
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <Upload size={16} color={cvFile ? 'var(--g600)' : 'var(--gray400)'} style={{ flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  {cvFile ? (
                    <>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--g700)' }}>{cvFile.name}</div>
                      <div style={{ fontSize:11, color:'var(--gray400)' }}>{(cvFile.size / 1024).toFixed(0)} KB</div>
                    </>
                  ) : (
                    <div style={{ fontSize:13, color:'var(--gray400)' }}>
                      اسحب ملف CV هنا أو <span style={{ color:'var(--g600)', fontWeight:600 }}>اضغط للاختيار</span>
                      <div style={{ fontSize:11, marginTop:3 }}>PDF / DOC / DOCX — بحد أقصى 5MB</div>
                    </div>
                  )}
                </div>
                {cvFile && (
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setCvFile(null) }}
                    style={{ background:'none', border:'none', color:'var(--gray400)', cursor:'pointer', padding:4, flexShrink:0 }}
                  >
                    <X size={14} />
                  </button>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]) }}
                  style={{ display:'none' }}
                />
              </label>
            </div>

            {/* ── ENHANCEMENT 3: Upload progress bar ───────────── */}
            {loading && progress > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--gray400)', marginBottom:4 }}>
                  <span>جارٍ الرفع...</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height:4, background:'var(--gray100)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{
                    height:'100%',
                    width:`${progress}%`,
                    background:'var(--g600)',
                    borderRadius:2,
                    transition:'width 0.2s ease',
                  }} />
                </div>
              </div>
            )}

            {/* ── PDPL consent_v2: موافقة على المعالجة بالذكاء الاصطناعي ── */}
            <label style={{
              display:'flex', alignItems:'flex-start', gap:10,
              padding:'12px 14px', marginBottom:12,
              background: aiConsent ? 'var(--g50)' : 'var(--gray50)',
              border: `1.5px solid ${aiConsent ? 'var(--g200)' : 'var(--gray200)'}`,
              borderRadius:'var(--r-md)', cursor:'pointer', transition:'all 0.2s',
            }}>
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={e => setAiConsent(e.target.checked)}
                style={{ marginTop:2, accentColor:'var(--g700)', flexShrink:0 }}
              />
              <span style={{ fontSize:12, color:'var(--gray600)', lineHeight:1.6 }}>
                أوافق على تحليل طلبي بالذكاء الاصطناعي لمطابقته مع متطلبات الوظيفة.
                {' '}<span style={{ color:'var(--g600)', fontWeight:600 }}>اختياري</span>
                {' '}— يساعد جهة التوظيف على مراجعة الطلبات بشكل أسرع.
              </span>
            </label>

            <button onClick={handleSubmit} disabled={loading} style={{
              width:'100%', padding:14, marginTop:4,
              background: loading ? 'var(--g600)' : 'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:600, transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {loading ? <><Loader size={16} style={{ animation:'spin 1s linear infinite' }} /> جارٍ الإرسال...</> : 'تأكيد التقديم النهائي ←'}
            </button>

            {error && <p style={{ fontSize:12, color:'#E24B4A', textAlign:'center', marginTop:8 }}>{error}</p>}

            <p style={{ fontSize:12, color:'var(--gray400)', textAlign:'center', marginTop:12 }}>
              بياناتك ستُشارك مع جهة العمل المعنية فقط
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes checkBounce { 0%{opacity:0;transform:scale(0.4)} 65%{transform:scale(1.1)} 80%{transform:scale(0.95)} 100%{opacity:1;transform:scale(1)} }
        @keyframes scoreFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ringFill    { from{stroke-dashoffset:226} }
        @keyframes dotPop      { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  )
}
