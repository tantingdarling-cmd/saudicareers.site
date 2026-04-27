import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { UploadCloud, XCircle, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { tipsApi, sectionsApi } from '../services/api'
import { useFadeIn } from '../hooks/useFadeIn'
import html2canvas from 'html2canvas' // NEW
import jsPDF from 'jspdf'              // NEW

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

/* ── Resume Strength Meter ─────────────────── */
function calcStrength(resume) {
  let score = 0
  const feedback = []

  if (resume?.summary)                          { score += 20 } else { feedback.push('أضف ملخصاً احترافياً') }
  if ((resume?.experience?.length ?? 0) > 1)   { score += 20 } else { feedback.push('أضف أكثر من خبرة عمل') }
  if ((resume?.skills?.length ?? 0) > 5)       { score += 20 } else { feedback.push('أضف المزيد من المهارات') }
  if (resume?.experience?.some(e => e.bullets?.length > 0)) { score += 20 } else { feedback.push('أضف إنجازات قابلة للقياس') }
  if ((resume?.summary?.length ?? 0) > 100)    { score += 20 } else { feedback.push('حسّن بنية السيرة ووسّع المحتوى') }

  return { score, feedback }
}

function StrengthMeter({ resume }) {
  const { score, feedback } = calcStrength(resume)
  const color = score >= 80 ? 'var(--g600)' : score >= 40 ? '#d97706' : '#dc2626'

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>قوة السيرة الذاتية</span>
        <span style={{ fontSize: 18, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ background: 'var(--gray200)', borderRadius: 50, height: 7, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ height: '100%', borderRadius: 50, background: color, width: `${score}%`, transition: 'width 0.4s ease' }} />
      </div>
      {feedback.length > 0 && (
        <ul style={{ margin: 0, paddingRight: 16 }}>
          {feedback.map((f, i) => (
            <li key={i} style={{ fontSize: 12, color: 'var(--gray500)', lineHeight: 1.8 }}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Progress Tracking ─────────────────────── */
const SCORES_KEY = 'resume_scores'

function saveScore(score) {
  try {
    const prev = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]')
    const next = [...prev, { score, date: Date.now() }].slice(-5)
    localStorage.setItem(SCORES_KEY, JSON.stringify(next))
  } catch (_) {}
}

function loadScores() {
  try { return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]') } catch (_) { return [] }
}

function ProgressTracker({ currentScore }) {
  const scores  = loadScores()
  const last    = scores[scores.length - 1]?.score ?? currentScore
  const prev    = scores.length >= 2 ? scores[scores.length - 2]?.score : null
  const diff    = prev != null ? last - prev : null

  const diffMsg = diff == null
    ? 'هذه أول نتيجة لك'
    : diff > 0 ? `تحسنت بنسبة +${diff}% 🔥`
    : diff < 0 ? `انخفضت النتيجة ${diff}%`
    : 'النتيجة ثابتة'

  const motivation = last > 80
    ? '🔥 ممتاز! جاهز للتقديم'
    : last >= 60
    ? '👍 قريب توصل لنتيجة قوية'
    : '🚀 تحتاج شوية تحسين وبتوصل'

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)', marginBottom: 14 }}>📈 تطورك</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 100, background: 'var(--gray50)', borderRadius: 'var(--r-lg)', padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>آخر نتيجة</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g700)' }}>{last}%</div>
        </div>
        {prev != null && (
          <div style={{ flex: 1, minWidth: 100, background: 'var(--gray50)', borderRadius: 'var(--r-lg)', padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>النتيجة السابقة</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray500)' }}>{prev}%</div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 100, background: diff > 0 ? 'var(--g50)' : diff < 0 ? '#fef2f2' : 'var(--gray50)', borderRadius: 'var(--r-lg)', padding: '10px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>التغيير</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: diff > 0 ? 'var(--g700)' : diff < 0 ? '#dc2626' : 'var(--gray500)' }}>{diffMsg}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gray600)', textAlign: 'center' }}>{motivation}</div>
    </div>
  )
}

/* ── Addiction Loop ────────────────────────── */
const DAILY_MISSIONS = [
  'أضف رقم هاتف محدّث في سيرتك',
  'اكتب ملخصاً لا يتجاوز 3 جمل',
  'أضف إنجازاً واحداً بأرقام حقيقية',
  'تحقق من كلمات الوظيفة في سيرتك',
  'راجع ترتيب خبراتك من الأحدث للأقدم',
  'أضف مهارة تقنية واحدة جديدة',
  'احذف أي معلومة غير ذات صلة',
]
const MISSION_KEY = 'daily_mission'

function AddictionLoop({ result }) {
  const score   = result?.score ?? 0
  const resume  = result?.optimized_resume
  const missing = result?.missing ?? []

  const level = score < 40
    ? { label: 'ضعيف',  icon: '🔴', color: '#dc2626' }
    : score < 70
    ? { label: 'متوسط', icon: '🟡', color: '#d97706' }
    : { label: 'قوي',   icon: '🟢', color: 'var(--g600)' }

  const nextStep = missing.length > 0
    ? `أضف هذه المهارات: ${missing.slice(0, 3).join('، ')}`
    : score < 80
    ? 'حسّن ملخصك وأضف إنجازات بأرقام'
    : 'سيرتك ممتازة — ابدأ التقديم الآن!'

  const checklist = [
    { label: 'معلومات التواصل',  done: !!resume?.summary },
    { label: 'المهارات',         done: (resume?.skills?.length ?? 0) > 3 },
    { label: 'الهيكل والتنسيق', done: (resume?.experience?.length ?? 0) > 0 },
    { label: 'كلمات الوظيفة',   done: missing.length === 0 },
  ]

  const day     = Math.floor(Date.now() / 86400000)
  const mission = DAILY_MISSIONS[day % DAILY_MISSIONS.length]
  try { localStorage.setItem(MISSION_KEY, mission) } catch (_) {}

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 16,
    }}>
      {/* Level + Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>مستوى سيرتك</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: level.color }}>{level.icon} {level.label}</span>
      </div>
      <div style={{ background: 'var(--gray200)', borderRadius: 50, height: 8, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', borderRadius: 50, background: level.color, width: `${score}%`, transition: 'width 0.5s ease' }} />
      </div>

      {/* Next Step */}
      <div style={{
        background: 'var(--g50)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 14,
        fontSize: 13, color: 'var(--g800)', fontWeight: 500,
      }}>
        🎯 الخطوة التالية: {nextStep}
      </div>

      {/* Checklist */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray500)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>قائمة التحقق</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {checklist.map(({ label, done }) => (
            <div key={label} style={{ fontSize: 12, color: done ? 'var(--g700)' : 'var(--gray400)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{done ? '✅' : '⬜'}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Mission */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 'var(--r-md)', padding: '10px 14px',
        fontSize: 12, color: '#78350f',
      }}>
        <span style={{ fontWeight: 700 }}>🏆 مهمة اليوم: </span>{mission}
      </div>
    </div>
  )
}

/* ── Retention System ──────────────────────── */
const LAST_JOB_KEY = 'last_job_desc'

function LastJobBanner({ onReuse }) {
  const [saved, setSaved] = useState(null)

  useEffect(() => {
    try {
      const v = localStorage.getItem(LAST_JOB_KEY)
      if (v) setSaved(v)
    } catch (_) {}
  }, [])

  if (!saved) return null

  return (
    <div style={{
      maxWidth: 460, margin: '0 auto 16px',
      background: 'var(--g50)', border: '1px solid var(--g200)',
      borderRadius: 'var(--r-lg)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: 13, color: 'var(--gray600)' }}>آخر وظيفة استخدمتها</div>
      <button onClick={() => onReuse(saved)} style={{
        fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 50,
        background: 'var(--g700)', color: 'var(--white)', border: 'none', cursor: 'pointer',
      }}>🔁 استخدم نفس الوصف</button>
    </div>
  )
}

function ScoreCompare() {
  const scores = loadScores()
  if (scores.length < 2) return null
  const [prev, last] = scores.slice(-2)
  const diff = last.score - prev.score

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)', marginBottom: 10 }}>📊 مقارنة آخر نتيجتين</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, textAlign: 'center', background: 'var(--gray50)', borderRadius: 'var(--r-md)', padding: '10px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>السابقة</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray500)' }}>{prev.score}%</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: diff >= 0 ? 'var(--g50)' : '#fef2f2', borderRadius: 'var(--r-md)', padding: '10px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>الأخيرة</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: diff >= 0 ? 'var(--g700)' : '#dc2626' }}>{last.score}%</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', background: 'var(--gray50)', borderRadius: 'var(--r-md)', padding: '10px 0' }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 3 }}>الفرق</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: diff >= 0 ? 'var(--g700)' : '#dc2626' }}>
            {diff >= 0 ? '+' : ''}{diff}%
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Daily Insight ─────────────────────────── */
const INSIGHTS = [
  'استخدم أفعال قوية مثل: طورت، أدرت، حسّنت',
  'لا تستخدم جمل طويلة — اختصر وكن واضح',
  'أضف أرقام وإنجازات حقيقية',
  'استخدم كلمات مفتاحية من وصف الوظيفة',
  'رتّب خبراتك من الأحدث للأقدم',
]
const INSIGHT_KEY = 'daily_resume_insight'

function DailyInsight() {
  const day     = Math.floor(Date.now() / 86400000)
  const insight = INSIGHTS[day % INSIGHTS.length]

  try { localStorage.setItem(INSIGHT_KEY, insight) } catch (_) {}

  return (
    <div style={{
      background: '#fffbeb', border: '1px solid #fde68a',
      borderRadius: 'var(--r-lg)', padding: '14px 18px', marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>💡 نصيحة اليوم</div>
      <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.75 }}>{insight}</div>
    </div>
  )
}

/* ── Daily Tip ─────────────────────────────── */
const TIP_CACHE_KEY = 'daily_tip'

function DailyTip() {
  const [tip, setTip] = useState(null)

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(TIP_CACHE_KEY) || 'null')
      if (cached && Date.now() - cached.ts < 86400000) { setTip(cached.tip); return }
    } catch (_) {}

    tipsApi.getAll({ per_page: 5 }).then(res => {
      const list = res?.data?.data ?? res?.data ?? []
      if (!list.length) return
      const picked = list[new Date().getDate() % list.length]
      setTip(picked)
      try { localStorage.setItem(TIP_CACHE_KEY, JSON.stringify({ tip: picked, ts: Date.now() })) } catch (_) {}
    }).catch(() => {})
  }, [])

  if (!tip) return null

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)', marginBottom: 10 }}>💡 نصيحة اليوم</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g800)', marginBottom: 6 }}>{tip.title}</div>
      {tip.excerpt && (
        <div style={{ fontSize: 13, color: 'var(--gray500)', lineHeight: 1.75, marginBottom: 12 }}>{tip.excerpt}</div>
      )}
      <Link to={`/tips/${tip.slug}`} style={{
        fontSize: 13, fontWeight: 600, color: 'var(--g700)', textDecoration: 'none',
      }}>اقرأ المزيد ←</Link>
    </div>
  )
}

/* ── Saved Session ─────────────────────────── */
const SESSION_KEY = 'last_resume_session'

function SessionBanner({ onRestore }) {
  const [session, setSession] = useState(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      if (s?.result) setSession(s)
    } catch (_) {}
  }, [])

  if (!session) return null

  const hoursAgo = Math.round((Date.now() - session.date) / 3600000)
  const timeLabel = hoursAgo < 1 ? 'منذ أقل من ساعة' : `منذ ${hoursAgo} ساعة`

  return (
    <div style={{
      maxWidth: 640, margin: '0 auto 24px',
      background: 'var(--g50)', border: '1px solid var(--g200)',
      borderRadius: 'var(--r-lg)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    }}>
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>👋 رجعنا لك! </span>
        <span style={{ fontSize: 12, color: 'var(--gray500)' }}>{timeLabel}</span>
      </div>
      <button onClick={() => { onRestore(session.result); setSession(null) }} style={{
        fontSize: 13, fontWeight: 600, padding: '7px 18px', borderRadius: 50,
        background: 'var(--g700)', color: 'var(--white)', border: 'none', cursor: 'pointer',
      }}>استكمال التعديل</button>
    </div>
  )
}

/* ── Tailoring Loader ──────────────────────── */
const TAILOR_STEPS = [
  '🧠 جاري تحليل سيرتك...',
  '🔍 نحدد المهارات الأساسية...',
  '📊 نقارن مع متطلبات الوظيفة...',
  '✍️ نعيد صياغة المحتوى...',
]

function TailoringLoader() {
  const [step, setStep]       = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setStep(s => (s + 1) % TAILOR_STEPS.length)
        setVisible(true)
      }, 300)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '72px 0' }}>
      <div style={{
        fontSize: 16, fontWeight: 600, color: 'var(--g800)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}>
        {TAILOR_STEPS[step]}
      </div>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 6 }}>
        {TAILOR_STEPS.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i === step ? 'var(--g600)' : 'var(--gray300)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

/* ── Before vs After ──────────────────────── */
function BeforeAfter({ before, after }) {
  if (!before && !after) return null
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>قبل وبعد التحسين</span>
        <div style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 2 }}>انظر كيف تحسّنت سيرتك الذاتية</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: 'var(--gray50)', border: '1px solid var(--gray200)',
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>قبل</div>
          <p style={{ fontSize: 13, color: 'var(--gray400)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
            {before ? before.slice(0, 300) : '—'}
          </p>
        </div>
        <div style={{
          background: 'var(--g50)', border: '1px solid var(--g200)',
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>بعد</div>
          <p style={{ fontSize: 13, color: 'var(--g900)', lineHeight: 1.75, margin: 0, fontWeight: 500 }}>
            {after || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Recruiter Simulation ──────────────────── */
function RecruiterView({ result }) {
  const resume   = result?.optimized_resume
  const strength = calcStrength(resume).score
  const missing  = result?.missing ?? []
  const expCount = resume?.experience?.length ?? 0
  const skillCount = resume?.skills?.length ?? 0

  const verdict = strength > 80 ? 'مرشح قوي' : strength > 50 ? 'مستواك جيد' : 'تحتاج تحسين'
  const verdictColor = strength > 80 ? 'var(--g700)' : strength > 50 ? '#d97706' : '#dc2626'

  const feedback = []
  if (missing.length > 0)  feedback.push('فيه مهارات مهمة ناقصة')
  if (expCount < 2)        feedback.push('قسم الخبرة يحتاج تقوية')
  if (skillCount <= 5)     feedback.push('حاول تضيف إنجازات واضحة')

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--gray200)',
      borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>👀 كيف يشوفك مسؤول التوظيف</div>
        <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 3 }}>هذا التقييم مبني على طريقة قراءة مسؤولي التوظيف للسير الذاتية</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: feedback.length ? 14 : 0, flexWrap: 'wrap' }}>
        <div style={{
          flex: 1, minWidth: 130, background: 'var(--gray50)',
          borderRadius: 'var(--r-lg)', padding: '10px 14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 4 }}>الحكم</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: verdictColor }}>{verdict}</div>
        </div>
        <div style={{
          flex: 1, minWidth: 130, background: 'var(--gray50)',
          borderRadius: 'var(--r-lg)', padding: '10px 14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: 'var(--gray400)', marginBottom: 4 }}>📊 فرصة ترشيحك للمقابلة</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: verdictColor }}>{strength}%</div>
        </div>
      </div>

      {feedback.length > 0 && (
        <ul style={{ margin: 0, paddingRight: 16 }}>
          {feedback.map((f, i) => (
            <li key={i} style={{ fontSize: 12, color: 'var(--gray600)', lineHeight: 1.85 }}>⚠ {f}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Template Renderer ─────────────────────── */
const TEMPLATES = ['minimal', 'executive', 'tech', 'creative']

const TEMPLATE_LABELS = { minimal: 'بسيط', executive: 'تنفيذي', tech: 'تقني', creative: 'إبداعي' }

function ResumeTemplate({ data, template }) {
  if (!data) return null

  const accent = template === 'creative' ? 'var(--g600)' : 'var(--g900)'

  const base = {
    maxWidth: 680, margin: '0 auto',
    background: 'var(--white)',
    borderRadius: 'var(--r-xl)',
    padding: '32px 36px',
    border: '1px solid var(--gray200)',
    fontFamily: template === 'tech' ? 'monospace' : 'inherit',
  }

  return (
    <div style={base}>
      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: template === 'executive' ? 13 : 12,
            fontWeight: 700, letterSpacing: 1,
            color: accent, textTransform: 'uppercase', marginBottom: 8,
            borderBottom: template === 'minimal' ? 'none' : `2px solid ${accent}`,
            paddingBottom: 4,
          }}>ملخص</div>
          <p style={{ fontSize: 14, color: 'var(--gray700)', lineHeight: 1.8, margin: 0 }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {data.skills?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            color: accent, textTransform: 'uppercase', marginBottom: 10,
            borderBottom: template === 'minimal' ? 'none' : `2px solid ${accent}`,
            paddingBottom: 4,
          }}>المهارات</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{
                fontSize: 13, padding: '4px 12px',
                background: template === 'creative' ? 'var(--g50)' : 'var(--gray100)',
                color: template === 'tech' ? accent : 'var(--gray800)',
                borderRadius: 50,
                border: template === 'tech' ? `1px solid ${accent}` : 'none',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience?.length > 0 && (
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1,
            color: accent, textTransform: 'uppercase', marginBottom: 12,
            borderBottom: template === 'minimal' ? 'none' : `2px solid ${accent}`,
            paddingBottom: 4,
          }}>الخبرات</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 14, fontWeight: template === 'executive' ? 700 : 600,
                color: 'var(--g900)', marginBottom: 6,
              }}>{exp.title}</div>
              <ul style={{ margin: 0, paddingRight: 20 }}>
                {exp.bullets?.map((b, j) => (
                  <li key={j} style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.75 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// NEW
const JOB_PRESETS = {
  'Software Engineer':     'We are looking for a Software Engineer with experience in JavaScript, React, Node.js, and SQL. Responsibilities include building scalable web applications, writing clean code, and collaborating with cross-functional teams.',
  'Marketing Specialist':  'Seeking a Marketing Specialist with skills in digital marketing, content creation, SEO, and communication. Responsibilities include managing campaigns, analyzing data, and growing brand awareness.',
  'HR Manager':            'Looking for an HR Manager with expertise in recruitment, leadership, teamwork, and employee relations. Responsibilities include managing hiring processes, onboarding, and HR policy development.',
  'Accountant':            'We need an Accountant proficient in SQL, financial reporting, and problem solving. Responsibilities include managing accounts, preparing financial statements, and ensuring regulatory compliance.',
}

/* ── Main Page ─────────────────────────────── */
export default function ResumeAnalyzer() {
  const [phase, setPhase]         = useState('idle')  // idle | uploading | error
  const [progress, setProgress]   = useState(0)
  const [errorMsg, setErrorMsg]   = useState('')
  const [inlineError, setInlineError] = useState('')
  const [consent, setConsent]     = useState(false)
  const [template, setTemplate]   = useState('minimal')
  const [tailorResult, setTailorResult] = useState(null)
  const [jobDesc, setJobDesc]     = useState('')
  const [originalText, setOriginalText] = useState('')
  const [sections, setSections] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    sectionsApi.getAll()
      .then(list => {
        const map = {}
        list.forEach(s => { map[s.key] = s })
        setSections(map)
      })
      .catch(() => {})
  }, [])

  const heroRef     = useFadeIn()
  const featuresRef = useFadeIn()
  const beforeAfterRef = useFadeIn()

  // Save last job description
  useEffect(() => {
    if (!jobDesc) return
    try { localStorage.setItem(LAST_JOB_KEY, jobDesc) } catch (_) {}
  }, [jobDesc])

  // Save session whenever a tailor result arrives
  useEffect(() => {
    if (!tailorResult) return
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ result: tailorResult, date: Date.now() })) } catch (_) {}
  }, [tailorResult])

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
          setInlineError('يرجى رفع السيرة الذاتية وإضافة وصف الوظيفة')
          setPhase('idle')
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
    setInlineError('')
  }

  // NEW
  const handleDownloadPDF = async () => {
    const el = document.getElementById('resume-preview')
    if (!el) return
    const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save('optimized-resume.pdf')
  }

  return (
    <>
      <Helmet>
        <title>تحسين السيرة الذاتية لسوق العمل السعودي | سعودي كارييرز</title>
        <meta name="description" content="حسّن سيرتك الذاتية وطابقها مع الوظيفة المستهدفة خلال ثوانٍ. تحليل ATS فوري، مقارنة المهارات، وتوصيات مخصصة للسوق السعودي." />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'كيف أحسّن سيرتي الذاتية للسوق السعودي؟', acceptedAnswer: { '@type': 'Answer', text: 'ارفع سيرتك بصيغة PDF وأضف وصف الوظيفة المستهدفة. سيقوم النظام بتحليل المهارات ومقارنتها وإعادة صياغة السيرة لتتوافق مع متطلبات الوظيفة.' } },
            { '@type': 'Question', name: 'ما هي أنظمة ATS وكيف تؤثر على قبول سيرتي؟', acceptedAnswer: { '@type': 'Answer', text: 'أنظمة ATS هي برامج تصفية آلية تستخدمها الشركات. 75٪ من السير الذاتية تُرفض قبل أن يقرأها بشر. المطابقة الصحيحة للكلمات المفتاحية تزيد فرص القبول.' } },
            { '@type': 'Question', name: 'هل بياناتي محفوظة؟', acceptedAnswer: { '@type': 'Answer', text: 'لا. يُحذف الملف فور اكتمال التحليل ولا يُحفظ على خوادمنا وفقاً لنظام حماية البيانات الشخصية PDPL.' } },
            { '@type': 'Question', name: 'ما المهارات التي يبحث عنها أصحاب العمل في السعودية؟', acceptedAnswer: { '@type': 'Answer', text: 'المهارات التقنية كـ Excel وSQL والبرمجة، ومهارات التواصل والقيادة وحل المشكلات، إضافة إلى الكلمات المفتاحية المطابقة لوصف الوظيفة.' } },
          ],
        })}</script>
      </Helmet>

      <div style={{
        minHeight:'100vh',
        padding:'120px clamp(1rem,4vw,3rem) 80px',
        background:'linear-gradient(180deg, var(--g50) 0%, var(--white) 50%)',
      }}>
        <SessionBanner onRestore={setTailorResult} />

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

          {/* Hero */}
          <h1 ref={heroRef} className="fade-in-section" style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:700,
            color:'var(--g950)', lineHeight:1.3, marginBottom:16 }}>
            سوّ سيرتك الذاتية بطريقة<br />
            <span style={{ color:'var(--g600)', borderBottom:'2px solid var(--g400)' }}>احترافية</span>
            {' '}خلال دقائق
          </h1>
          <p style={{ fontSize:15, color:'var(--gray600)', lineHeight:1.85, maxWidth:480, margin:'0 auto 16px' }}>
            نحلل سيرتك، نطابقها مع الوظيفة، ونجهزها بشكل جاهز للتقديم
          </p>
          <div style={{ fontSize:13, color:'#d97706', fontWeight:600, marginBottom:20 }}>
            🔥 جهّز سيرتك قبل ما يفوتك التقديم &nbsp;·&nbsp; <span style={{ color:'var(--gray500)', fontWeight:400 }}>⚡ كثير يستخدمون الأداة حالياً</span>
          </div>
          <a href="#upload-section" style={{
            display:'inline-block', background:'var(--g700)', color:'var(--white)',
            fontSize:15, fontWeight:700, padding:'13px 36px', borderRadius:50,
            textDecoration:'none', transition:'all 0.2s',
            boxShadow:'0 4px 16px rgba(0,0,0,0.10)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--g900)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(34,197,94,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--g700)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.10)' }}
            onMouseDown={e => e.currentTarget.style.transform='scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
          >عدّل سيرتك الآن</a>

          <div style={{ fontSize:12, color:'var(--gray400)', marginTop:10 }}>
            ابدأ الآن — خلال أقل من 30 ثانية
          </div>

          {/* Social Proof */}
          <div style={{ fontSize:13, color:'var(--gray500)', marginTop:14 }}>
            ⭐ أكثر من 1,000 باحث عن عمل استخدموا الخدمة
          </div>

          {/* Fast Benefits */}
          <div style={{ display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap', marginTop:20 }}>
            {['⚡ خلال ثواني', '📄 بدون تعقيد', '🎯 مناسب للسوق السعودي'].map(b => (
              <span key={b} style={{ fontSize:12, color:'var(--gray600)', fontWeight:600 }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Before / After Block */}
        <div ref={beforeAfterRef} className="fade-in-section" style={{ maxWidth:560, margin:'0 auto 40px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div style={{
            background:'var(--gray50)', border:'1px solid var(--gray200)',
            borderRadius:'var(--r-lg)', padding:'20px 18px', textAlign:'center',
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>قبل</div>
            <div style={{ fontSize:13, color:'var(--gray400)', lineHeight:1.8 }}>CV عادي</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start' }}>
              {['بدون ملخص', 'مهارات ناقصة', 'هيكل ضعيف'].map(t => (
                <span key={t} style={{ fontSize:11, color:'#dc2626', background:'#fef2f2', padding:'2px 10px', borderRadius:50 }}>✗ {t}</span>
              ))}
            </div>
          </div>
          <div style={{
            background:'var(--g50)', border:'1px solid var(--g200)',
            borderRadius:'var(--r-lg)', padding:'20px 18px', textAlign:'center',
          }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--g600)', textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>بعد</div>
            <div style={{ fontSize:13, color:'var(--g800)', fontWeight:600, lineHeight:1.8 }}>CV جاهز للتقديم</div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start' }}>
              {['ملخص احترافي', 'مهارات مكتملة', 'هيكل واضح'].map(t => (
                <span key={t} style={{ fontSize:11, color:'var(--g700)', background:'var(--g100)', padding:'2px 10px', borderRadius:50 }}>✓ {t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="fade-in-section" style={{ maxWidth:720, margin:'0 auto 48px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:14 }}>
          {[
            { icon:'🧠', title:'تحليل ذكي',      text:'نفهم سيرتك ونحدد نقاط القوة والضعف' },
            { icon:'🎯', title:'مطابقة الوظيفة', text:'نضبط سيرتك حسب الوظيفة اللي تقدم عليها' },
            { icon:'⚡', title:'نتيجة فورية',    text:'تشوف النتيجة جاهزة خلال ثواني' },
            { icon:'📄', title:'جاهز للتقديم',   text:'تنزل سيرتك بصيغة احترافية مباشرة' },
          ].map(({ icon, title, text }) => (
            <div key={title}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)';    e.currentTarget.style.boxShadow='none' }}
              style={{
                background:'var(--white)', border:'1px solid var(--gray200)',
                borderRadius:'var(--r-lg)', padding:'18px 16px', textAlign:'center',
                transition:'transform 0.2s, box-shadow 0.2s', cursor:'default',
              }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--g900)', marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:12, color:'var(--gray500)', lineHeight:1.7 }}>{text}</div>
            </div>
          ))}
        </div>

        <hr style={{ maxWidth:560, margin:'0 auto 40px', border:'none', borderTop:'1px solid var(--gray200)' }} />

        {/* Content */}
        <div id="upload-section" />
        <p style={{ textAlign:'center', fontSize:12, color:'var(--gray400)', marginBottom:20 }}>
          🔒 بياناتك آمنة — لا نحفظ سيرتك بدون إذنك
        </p>
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

            {/* ── Inline Validation Error ── */}
            {inlineError && (
              <div style={{
                maxWidth: 460, margin: '0 auto 16px',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 'var(--r-lg)', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626',
              }}>
                <XCircle size={18} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{inlineError}</span>
              </div>
            )}

            <LastJobBanner onReuse={v => { setJobDesc(v); document.getElementById('job-desc-input')?.focus() }} />

            {/* ── Empty State ── */}
            <div style={{
              maxWidth: 460, margin: '0 auto 20px',
              background: 'var(--gray50)', border: '1px dashed var(--gray300)',
              borderRadius: 'var(--r-lg)', padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray700)', marginBottom: 3 }}>
                  ما عندك سيرة ذاتية جاهزة؟
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray400)', lineHeight: 1.6 }}>
                  ابدأ من هنا وخلي النظام يساعدك خطوة بخطوة
                </div>
              </div>
              <button onClick={() => document.getElementById('job-desc-input')?.focus()} style={{
                fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 50,
                background: 'var(--white)', border: '1.5px solid var(--gray300)',
                color: 'var(--gray700)', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--g500)'; e.currentTarget.style.color = 'var(--g700)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray300)'; e.currentTarget.style.color = 'var(--gray700)' }}
              >أنشئ سيرة من الصفر</button>
            </div>

            {/* ── Tips Block ── NEW */}
            <div style={{ maxWidth: 460, margin: '0 auto 20px', background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r-lg)', padding: '14px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g800)', marginBottom: 8 }}>نصائح للحصول على نتائج أفضل</div>
              <ul style={{ margin: 0, paddingRight: 18 }}>
                {['استخدم وصف وظيفي واضح ومفصّل', 'أضف الكلمات المفتاحية من الإعلان', 'ركّز على المسؤوليات والمتطلبات'].map((tip, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--gray600)', lineHeight: 1.8 }}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* ── Job Description Input ── NEW */}
            <div style={{ maxWidth: 460, margin: '0 auto 20px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {Object.keys(JOB_PRESETS).map(label => (
                  <button key={label} onClick={() => setJobDesc(JOB_PRESETS[label])} style={{
                    fontSize: 12, padding: '5px 14px', borderRadius: 50, cursor: 'pointer',
                    border: '1px solid var(--gray300)', background: 'var(--white)',
                    color: 'var(--gray700)', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--g50)'; e.currentTarget.style.borderColor = 'var(--g400)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.borderColor = 'var(--gray300)' }}
                  >{label}</button>
                ))}
              </div>
              <textarea
                id="job-desc-input"
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="الصق وصف الوظيفة أو اختر نموذجاً جاهزاً..."
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  fontSize: 13, color: 'var(--gray700)',
                  border: '1.5px solid var(--gray200)', borderRadius: 'var(--r-lg)',
                  padding: '12px 14px', resize: 'vertical', lineHeight: 1.7,
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
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
        {/* Tailor: loading state */}
        {phase === 'tailoring' && <TailoringLoader />}

        {/* Tailor Result */}
        {tailorResult?.optimized_resume && (
          <div style={{ maxWidth: 720, margin: '48px auto 0' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g950)', marginBottom: 4 }}>
                📄 هذه السيرة مُحسَّنة لوظيفتك المستهدفة
              </div>
              {tailorResult.score >= 80
                ? <div style={{ fontSize: 14, color: 'var(--g600)', fontWeight: 700 }}>🔥 سيرتك جاهزة للتقديم!</div>
                : <div style={{ fontSize: 13, color: 'var(--g600)', fontWeight: 600 }}>✅ سيرتك جاهزة للتقديم</div>
              }

              {/* Improvement Banner */}
              <div style={{ fontSize: 14, color: '#d97706', fontWeight: 700, marginTop: 8 }}>
                🔥 تم تحسين سيرتك بنسبة +{tailorResult.score ?? 0}%
              </div>

              {/* Goal Indicator */}
              <div style={{ fontSize: 12, color: 'var(--gray500)', marginTop: 4 }}>
                🎯 هدفك: 80%+
                {(tailorResult.score ?? 0) >= 80 && <span style={{ color: 'var(--g600)', fontWeight: 700 }}> — وصلت! 🎉</span>}
              </div>

              {/* Social Proof */}
              <div style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 6 }}>
                ⭐ أكثر من 120 شخص حسّنوا سيرتهم اليوم
              </div>

              {/* Viral Banner — score ≥ 70 only */}
              {(tailorResult.score ?? 0) >= 70 && (
                <div style={{ fontSize: 13, color: '#d97706', fontWeight: 700, marginTop: 10 }}>
                  🔥 سيرتك الآن جاهزة… لا تخليها لنفسك 😉
                </div>
              )}

              {/* Share Button */}
              <button onClick={() => {
                const score = tailorResult.score ?? 0
                const text = `🚀 سيرتي أصبحت احترافية بنسبة ${score}%\n✔ جاهز للتقديم\nsaudicareers.site`
                navigator.clipboard?.writeText(text).catch(() => {})
                alert('✅ تم نسخ النص — استعرض قوتك الآن!')
              }} style={{
                marginTop: 14, padding: '9px 24px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                background: 'var(--g700)', color: 'var(--white)', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(34,197,94,0.2)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--g900)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--g700)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.2)' }}
              >🔥 استعرض قوتك المهنية</button>
            </div>

            {/* Score + Missing */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, minWidth: 160,
                background: 'var(--g50)', border: '1px solid var(--g200)',
                borderRadius: 'var(--r-lg)', padding: '16px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, color: 'var(--gray500)', marginBottom: 4 }}>📊 نسبة التوافق</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--g700)' }}>
                  {tailorResult.score ?? 0}%
                </div>
              </div>

              {tailorResult.missing?.length > 0 && (
                <div style={{
                  flex: 2, minWidth: 220,
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 'var(--r-lg)', padding: '16px 20px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
                    ⚠️ مهارات مفقودة
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tailorResult.missing.map((s, i) => (
                      <span key={i} style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 50,
                        background: '#fef3c7', color: '#78350f',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Before vs After */}
            <BeforeAfter
              before={tailorResult.text_preview || originalText}
              after={tailorResult.optimized_resume?.summary}
            />

            {/* Why This Result */}
            <section aria-labelledby="why-result-heading" style={{
              background: 'var(--gray50)', border: '1px solid var(--gray200)',
              borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 20,
            }}>
              <h2 id="why-result-heading" style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)', marginBottom: 12, marginTop: 0 }}>
                🔍 لماذا هذه النتيجة؟
              </h2>
              <ul style={{ margin: 0, paddingRight: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.75 }}>
                  تم تحليل مهاراتك ومقارنتها بمتطلبات الوظيفة — النتيجة تعكس نسبة التوافق الحالية
                </li>
                {(tailorResult.missing?.length ?? 0) > 0 && (
                  <li style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.75 }}>
                    المهارات الناقصة ({tailorResult.missing.join('، ')}) تؤثر على النتيجة النهائية
                  </li>
                )}
                <li style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.75 }}>
                  كلما أضفت مهارات وخبرات أكثر، ارتفعت فرصك في اجتياز فلتر ATS
                </li>
              </ul>
            </section>

            {/* Strength Meter */}
            <StrengthMeter resume={tailorResult.optimized_resume} />

            {/* Recruiter View */}
            <RecruiterView result={tailorResult} />

            {/* Addiction Loop */}
            <AddictionLoop result={tailorResult} />

            {/* Progress Tracker */}
            <ProgressTracker currentScore={tailorResult.score ?? 0} />

            {/* Score Compare */}
            <ScoreCompare />

            {/* Second Job CTA */}
            <div style={{
              background: 'var(--g50)', border: '1px solid var(--g200)',
              borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>💼 عندك وظيفة ثانية؟</div>
              <button onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setTimeout(() => document.getElementById('job-desc-input')?.focus(), 600)
              }} style={{
                fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 50,
                background: 'var(--g700)', color: 'var(--white)', border: 'none', cursor: 'pointer',
              }}>🎯 عدّل لنفسك وظيفة ثانية</button>
            </div>

            {/* Daily Insight */}
            <DailyInsight />

            {/* Daily Tip */}
            <DailyTip />

            {/* Template Selector */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--gray500)', marginBottom: 10 }}>اختر قالب العرض</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                {TEMPLATES.map(t => (
                  <button key={t} onClick={() => setTemplate(t)} style={{
                    padding: '7px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: template === t ? 'var(--g700)' : 'var(--gray300)',
                    background: template === t ? 'var(--g700)' : 'var(--white)',
                    color: template === t ? 'var(--white)' : 'var(--gray700)',
                    transition: 'all 0.15s',
                  }}>{TEMPLATE_LABELS[t]}</button>
                ))}
              </div>
            </div>

            {/* NEW: wrapped for PDF capture */}
            <div id="resume-preview" style={{ background: '#ffffff' }}>
              <ResumeTemplate data={tailorResult.optimized_resume} template={template} />
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button onClick={handleDownloadPDF} style={{
                background: 'var(--g900)', color: 'var(--white)',
                border: 'none', borderRadius: 50, padding: '12px 32px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                تحميل PDF
              </button>
              {/* NEW */}
              <p style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 10 }}>
                هذا التحسين مبني على المعلومات التي أدخلتها.
              </p>
            </div>
          </div>
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
