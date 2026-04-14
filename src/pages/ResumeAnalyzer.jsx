import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { UploadCloud, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || 'https://saudicareers.site/api'

/* ── Score Ring (SVG) ──────────────────────── */
function ScoreRing({ score }) {
  const r       = 54
  const circ    = 2 * Math.PI * r
  const offset  = circ - (score / 100) * circ
  const color   = score >= 70 ? 'var(--g500)'
                : score >= 45 ? 'var(--gold500)'
                : '#ef4444'
  const label   = score >= 70 ? 'ممتاز' : score >= 45 ? 'متوسط' : 'يحتاج تحسين'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width={130} height={130} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke="var(--gray200)" strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ marginTop:-110, textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:30, fontWeight:800, color:'var(--g950)', fontFamily:'var(--font-en)' }}>{score}</div>
        <div style={{ fontSize:11, color:'var(--gray500)', fontWeight:600 }}>/ 100</div>
      </div>
      <div style={{
        fontSize:13, fontWeight:700, color, marginTop:8,
        background: score >= 70 ? 'var(--g50)' : score >= 45 ? 'var(--gold100)' : '#fef2f2',
        padding:'4px 16px', borderRadius:50,
        border: `1px solid ${score >= 70 ? 'var(--g200)' : score >= 45 ? 'var(--gold300)' : '#fecaca'}`,
      }}>{label}</div>
    </div>
  )
}

/* ── Check Item ────────────────────────────── */
const CHECK_LABELS = {
  has_contact:       'معلومات التواصل',
  standard_headings: 'عناوين قياسية (ATS)',
  good_keywords:     'كثافة الكلمات المفتاحية',
}

function CheckItem({ id, passed }) {
  const Icon = passed ? CheckCircle : XCircle
  const color = passed ? 'var(--g600)' : '#ef4444'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0',
      borderBottom:'1px solid var(--gray100)' }}>
      <Icon size={18} color={color} style={{ flexShrink:0 }} />
      <span style={{ fontSize:14, color:'var(--g950)', flex:1 }}>{CHECK_LABELS[id] || id}</span>
      <span style={{ fontSize:12, fontWeight:600, color }}>{passed ? 'اجتاز' : 'لم يجتز'}</span>
    </div>
  )
}

/* ── Results View ──────────────────────────── */
function ResultsView({ data, onReset }) {
  const allChecks = [...(data.passed || []), ...(data.failed || [])]

  return (
    <div style={{ maxWidth:560, margin:'0 auto', textAlign:'right' }}>
      {/* Score */}
      <div style={{
        background:'var(--white)', border:'1.5px solid var(--gray200)',
        borderRadius:'var(--r-xl)', padding:'32px 28px',
        boxShadow:'var(--shadow-lg)', marginBottom:20,
        display:'flex', flexDirection:'column', alignItems:'center',
      }}>
        <ScoreRing score={data.score} />
        <p style={{ fontSize:14, color:'var(--gray600)', marginTop:16, textAlign:'center', lineHeight:1.75, maxWidth:380 }}>
          سيرتك الذاتية تجتاز <strong style={{ color:'var(--g800)' }}>{data.score}٪</strong> من معايير أنظمة الفرز الآلي (ATS).
          {data.score < 60 && ' معظم الشركات الكبرى ترفض السير التي تقل عن 60٪ قبل أن يقرأها أحد.'}
        </p>
      </div>

      {/* Checks */}
      <div style={{
        background:'var(--white)', border:'1.5px solid var(--gray200)',
        borderRadius:'var(--r-xl)', padding:'24px 28px',
        boxShadow:'var(--shadow-sm)', marginBottom:20,
      }}>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:16 }}>
          نتيجة فحص المعايير
        </div>
        {allChecks.map(id => (
          <CheckItem key={id} id={id} passed={(data.passed || []).includes(id)} />
        ))}
      </div>

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div style={{
          background:'var(--g50)', border:'1px solid var(--g200)',
          borderRadius:'var(--r-xl)', padding:'24px 28px',
          boxShadow:'var(--shadow-sm)', marginBottom:24,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8,
            fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:14 }}>
            <AlertCircle size={18} color="var(--g600)" />
            توصيات التحسين
          </div>
          {data.recommendations.map((tip, i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--g500)',
                flexShrink:0, marginTop:7 }} />
              <span style={{ fontSize:14, color:'var(--gray700)', lineHeight:1.75 }}>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{
        background:'var(--g900)', borderRadius:'var(--r-xl)', padding:'28px',
        textAlign:'center', color:'var(--white)',
      }}>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>
          احصل على التقرير الكامل
        </div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,0.7)', marginBottom:20, lineHeight:1.75 }}>
          التقرير المجاني يُظهر المشكلة — التقرير الكامل يعطيك الحل التفصيلي والسيرة المُعدّلة.
        </div>
        <a href="#signup" onClick={e => {
          e.preventDefault()
          document.getElementById('signup')?.scrollIntoView({ behavior:'smooth' })
          window.history.pushState({}, '', '/#signup')
        }} style={{
          display:'inline-block',
          background:'var(--gold500)', color:'var(--g950)',
          padding:'12px 32px', borderRadius:50,
          fontSize:15, fontWeight:700, textDecoration:'none',
          transition:'background 0.2s',
        }}>
          سجّل واحصل على التقرير الكامل مجاناً ←
        </a>
      </div>

      {/* Retry */}
      <button onClick={onReset} style={{
        display:'block', width:'100%', marginTop:16,
        background:'none', border:'1.5px solid var(--gray200)',
        borderRadius:'var(--r-md)', padding:'11px',
        fontSize:14, color:'var(--gray600)', cursor:'pointer',
        transition:'all 0.2s',
      }}
      onMouseEnter={e => { e.target.style.borderColor='var(--g400)'; e.target.style.color='var(--g700)' }}
      onMouseLeave={e => { e.target.style.borderColor='var(--gray200)'; e.target.style.color='var(--gray600)' }}>
        تحليل سيرة أخرى
      </button>
    </div>
  )
}

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

/* ── Main Page ─────────────────────────────── */
export default function ResumeAnalyzer() {
  const [phase, setPhase]       = useState('idle')  // idle | uploading | error | done
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleFile = file => {
    setPhase('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

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
          setResult(res)
          setPhase('done')
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
    setResult(null)
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
        {phase === 'idle' && <UploadZone onFile={handleFile} />}
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
        {phase === 'done' && result && <ResultsView data={result} onReset={reset} />}
      </div>
    </>
  )
}
