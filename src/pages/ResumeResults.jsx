import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import HRTemplateCard, { HR_TEMPLATES } from '../components/HRTemplateCard.jsx'

// ── Helpers ──────────────────────────────────────────────────────────
const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])

function scoreColor(s) {
  return s >= 70 ? 'var(--g500)' : s >= 45 ? 'var(--gold500)' : '#ef4444'
}
function scoreLabel(s) {
  return s >= 70 ? 'ممتاز' : s >= 45 ? 'يحتاج تحسين' : 'ضعيف'
}
function scoreMessage(s) {
  if (s >= 70) return 'سيرتك تجتاز معظم أنظمة الفرز الآلي ATS'
  if (s >= 45) return 'معظم الشركات الكبرى ترفض ما دون ٦٠٪ — يمكن رفع نسبتك'
  return 'سيرتك تُرفض آلياً قبل أن يراها أحد — تحتاج إعادة هيكلة'
}

const CHECK_META = {
  has_contact:       { label: 'معلومات التواصل',           tip: 'أضف بريدك الإلكتروني ورقم هاتفك بوضوح في أعلى السيرة' },
  standard_headings: { label: 'عناوين ATS قياسية',         tip: 'استخدم: Experience, Education, Skills بدلاً من عناوين مبدعة' },
  good_keywords:     { label: 'كثافة الكلمات المفتاحية',   tip: 'أضف مصطلحات مهنية متخصصة تزيد كثافتها عن ٣٪ من النص' },
}

// ── Animated Score Ring (In-View trigger) ────────────────────────────
function ScoreRing({ score }) {
  const r      = 60
  const circ   = 2 * Math.PI * r
  const [animated, setAnimated] = useState(0)
  const containerRef = useRef(null)

  // الحلقة تتحرك فقط عند دخولها نطاق الرؤية
  useEffect(() => {
    let frame, start
    const run = ts => {
      if (!start) start = ts
      const p     = Math.min((ts - start) / 1400, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimated(Math.round(eased * score))
      if (p < 1) frame = requestAnimationFrame(run)
    }

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect()
        frame = requestAnimationFrame(run)
      }
    }, { threshold: 0.2 })

    if (containerRef.current) obs.observe(containerRef.current)
    return () => { obs.disconnect(); cancelAnimationFrame(frame) }
  }, [score])

  const color   = scoreColor(score)
  const offset  = circ - (animated / 100) * circ
  const bgColor = score >= 70 ? 'var(--g50)' : score >= 45 ? 'var(--gold100)' : '#fef2f2'
  const bdColor = score >= 70 ? 'var(--g200)' : score >= 45 ? 'var(--gold300)' : '#fecaca'

  return (
    <div ref={containerRef} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <div style={{ position:'relative', width:144, height:144 }}>
        <svg width={144} height={144} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={72} cy={72} r={r} fill="none" stroke="var(--gray200)" strokeWidth={12} />
          <circle cx={72} cy={72} r={r} fill="none" stroke={color} strokeWidth={12}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:32, fontWeight:800, color:'var(--g950)', lineHeight:1, fontFamily:'var(--font-en)' }}>
            {animated}
          </span>
          <span style={{ fontSize:12, color:'var(--gray400)', fontWeight:600 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize:13, fontWeight:700, color,
        background: bgColor, padding:'5px 20px', borderRadius:50,
        border: `1px solid ${bdColor}`,
      }}>
        {scoreLabel(score)}
      </span>
    </div>
  )
}

// ── Metric Card ───────────────────────────────────────────────────────
function MetricCard({ icon, value, label, sub, color = 'var(--g500)', bg = 'var(--g50)', bd = 'var(--g200)' }) {
  return (
    <div style={{
      background: bg, border: `1.5px solid ${bd}`,
      borderRadius: 'var(--r-lg)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, fontFamily:'var(--font-en)' }}>{value}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g950)' }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--gray400)', lineHeight: 1.5 }}>{sub}</span>}
    </div>
  )
}

// ── Check Row — Staggered In-View ────────────────────────────────────
function CheckRow({ id, passed, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const meta  = CHECK_META[id] || { label: id, tip: '' }
  const color = passed ? 'var(--g600)' : '#ef4444'
  const Icon  = passed ? CheckCircle : XCircle

  return (
    <div ref={ref} style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 0', borderBottom: '1px solid var(--gray100)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(12px)',
      transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
    }}>
      <Icon size={20} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g950)', marginBottom: 3 }}>
          {meta.label}
        </div>
        {!passed && meta.tip && (
          <div style={{ fontSize: 12, color: 'var(--gray400)', lineHeight: 1.6 }}>{meta.tip}</div>
        )}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 50, flexShrink: 0,
        background: passed ? 'var(--g50)' : '#fef2f2',
        color: passed ? 'var(--g600)' : '#ef4444',
        border: `1px solid ${passed ? 'var(--g200)' : '#fecaca'}`,
      }}>
        {passed ? 'اجتاز ✓' : 'لم يجتز'}
      </span>
    </div>
  )
}

// ── Recommendation Item ───────────────────────────────────────────────
function RecommendationItem({ text, index }) {
  const isFirst = index === 0
  const color   = isFirst ? '#c2410c' : 'var(--gold600)'
  const bg      = isFirst ? '#fff7ed' : 'var(--gold100)'
  const bd      = isFirst ? '#fed7aa' : 'var(--gold300)'
  const Icon    = AlertTriangle
  const label   = isFirst ? 'الأولوية الأولى' : `توصية ${toAr(index + 1)}`

  return (
    <div style={{
      borderInlineEnd: `4px solid ${color}`,
      background: bg, borderRadius: 'var(--r-md)',
      padding: '16px 20px', marginBottom: 12,
      display: 'flex', gap: 14, alignItems: 'flex-start',
    }}>
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          background: `color-mix(in srgb, ${color} 15%, white)`,
          padding: '2px 10px', borderRadius: 50,
          border: `1px solid ${bd}`,
          display: 'inline-block', marginBottom: 8,
        }}>{label}</span>
        <p style={{ fontSize: 14, color: 'var(--gray800)', lineHeight: 1.75, margin: 0 }}>{text}</p>
      </div>
    </div>
  )
}

// ── Fade wrapper ──────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="fade-in-section" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function ResumeResults() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`resume_result_${id}`)
      if (!raw) { navigate('/resume-analyzer', { replace: true }); return }
      setResult(JSON.parse(raw))
    } catch {
      navigate('/resume-analyzer', { replace: true })
    }
  }, [id, navigate])

  if (!result) return null

  const passed      = result.passed || []
  const failed      = result.failed || []
  const allChecks   = [...Object.keys(CHECK_META)].filter(k => passed.includes(k) || failed.includes(k))
  const totalChecks = allChecks.length || Object.keys(CHECK_META).length
  const passedCount = passed.length
  const recsCount   = result.recommendations?.length || 0

  const metricColor = (val, of) => val / of >= 0.67 ? 'var(--g500)' : val / of >= 0.34 ? 'var(--gold600)' : '#ef4444'
  const metricBg    = (val, of) => val / of >= 0.67 ? 'var(--g50)'  : val / of >= 0.34 ? 'var(--gold100)' : '#fef2f2'
  const metricBd    = (val, of) => val / of >= 0.67 ? 'var(--g200)' : val / of >= 0.34 ? 'var(--gold300)' : '#fecaca'

  return (
    <>
      <Helmet>
        <title>نتائج فحص ATS لسيرتك الذاتية | سعودي كارييرز</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        padding: '100px clamp(1rem,4vw,3rem) 80px',
        background: 'linear-gradient(180deg, var(--g50) 0%, var(--white) 40%)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* ── Header ── */}
          <FadeIn>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
              <Link to="/resume-analyzer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--gray500)', textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--g800)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray500)'}>
                <ArrowLeft size={14} /> تحليل سيرة أخرى
              </Link>
              <button onClick={() => navigate('/resume-analyzer')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, color: 'var(--gray500)', background: 'none',
                border: '1.5px solid var(--gray200)', borderRadius: 50,
                padding: '6px 16px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--g400)'; e.currentTarget.style.color = 'var(--g700)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray200)'; e.currentTarget.style.color = 'var(--gray500)' }}>
                <RotateCcw size={13} /> فحص جديد
              </button>
            </div>
          </FadeIn>

          {/* ── Layer 1: Score + Metrics ── */}
          <FadeIn delay={50}>
            <div style={{
              background: 'var(--white)', border: '1.5px solid var(--gray200)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(24px,4vw,36px)',
              boxShadow: 'var(--shadow-lg)', marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)', marginBottom: 20 }}>
                نتيجة فحص ATS
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,160px), 1fr))',
                gap: 16, alignItems: 'start',
              }}>
                {/* الدائرة */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <ScoreRing score={result.score} />
                  <p style={{ fontSize: 12, color: 'var(--gray500)', textAlign: 'center', lineHeight: 1.6, maxWidth: 160, marginTop: 4 }}>
                    {scoreMessage(result.score)}
                  </p>
                </div>

                {/* بطاقة المعايير */}
                <MetricCard
                  icon="✅"
                  value={`${passedCount}/${totalChecks}`}
                  label="معايير اجتزتها"
                  sub={passedCount === totalChecks ? 'جميع المعايير الأساسية محققة' : `${toAr(totalChecks - passedCount)} معيار ${totalChecks - passedCount === 1 ? 'يحتاج' : 'تحتاج'} تحسيناً`}
                  color={metricColor(passedCount, totalChecks)}
                  bg={metricBg(passedCount, totalChecks)}
                  bd={metricBd(passedCount, totalChecks)}
                />

                {/* بطاقة التوصيات */}
                <MetricCard
                  icon="💡"
                  value={toAr(recsCount)}
                  label="توصية تحسين"
                  sub={recsCount === 0 ? 'سيرتك قوية — لا توصيات' : 'نفّذها لترفع نسبتك فوق ٧٠٪'}
                  color={recsCount === 0 ? 'var(--g500)' : recsCount > 1 ? '#c2410c' : 'var(--gold600)'}
                  bg={recsCount === 0 ? 'var(--g50)' : recsCount > 1 ? '#fff7ed' : 'var(--gold100)'}
                  bd={recsCount === 0 ? 'var(--g200)' : recsCount > 1 ? '#fed7aa' : 'var(--gold300)'}
                />
              </div>
            </div>
          </FadeIn>

          {/* ── Layer 2: فحص المعايير ── */}
          <FadeIn delay={100}>
            <div style={{
              background: 'var(--white)', border: '1.5px solid var(--gray200)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(20px,4vw,28px)',
              boxShadow: 'var(--shadow-sm)', marginBottom: 20,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 4 }}>
                فحص المعايير الأساسية
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray400)', marginBottom: 16 }}>
                ٣ معايير تفصل بين سيرة تُقرأ وأخرى تُحذف آلياً
              </div>
              {Object.keys(CHECK_META).map((key, i) => (
                <CheckRow key={key} id={key} passed={passed.includes(key)} delay={i * 300} />
              ))}
            </div>
          </FadeIn>

          {/* ── Layer 3: التوصيات ── */}
          {result.recommendations?.length > 0 && (
            <FadeIn delay={150}>
              <div style={{
                background: 'var(--white)', border: '1.5px solid var(--gray200)',
                borderRadius: 'var(--r-xl)', padding: 'clamp(20px,4vw,28px)',
                boxShadow: 'var(--shadow-sm)', marginBottom: 20,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 4 }}>
                  التوصيات المُخصصة لسيرتك
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray400)', marginBottom: 20 }}>
                  مرتّبة حسب الأثر — نفّذها من الأعلى للأسفل
                </div>
                {result.recommendations.map((rec, i) => (
                  <RecommendationItem key={i} text={rec} index={i} />
                ))}
              </div>
            </FadeIn>
          )}

          {/* ── Layer 3.5: خارطة الطريق — HR Templates ── */}
          <FadeIn delay={175}>
            <div style={{
              background: 'var(--white)', border: '1.5px solid var(--gray200)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(20px,4vw,28px)',
              boxShadow: 'var(--shadow-sm)', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>🗺️</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)' }}>
                  خارطة طريقك التالية
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray400)', marginBottom: 20, paddingRight: 30 }}>
                ٣ أدوات عملية لتحويل نتائج التحليل إلى إجراءات فعلية — اضغط على أي بطاقة للتوسيع
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HR_TEMPLATES.map(t => (
                  <HRTemplateCard
                    key={t.id}
                    title={t.title}
                    icon={t.icon}
                    description={t.description}
                    checklist={t.checklist}
                    tips={t.tips}
                    redFlags={t.redFlags}
                  />
                ))}
              </div>
            </div>
          </FadeIn>

          {/* ── Layer 4: CTA ── */}
          <FadeIn delay={200}>
            <div style={{
              background: 'var(--g900)',
              borderRadius: 'var(--r-xl)', padding: 'clamp(28px,5vw,40px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              {/* خلفية زخرفية */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 60% 80% at 50% 120%, rgba(197,160,89,0.12) 0%, transparent 70%)',
              }}/>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold400)', marginBottom: 12 }}>
                  الخطوة التالية
                </div>
                <div style={{ fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 700, color: 'var(--white)', marginBottom: 12, lineHeight: 1.3 }}>
                  احصل على التحسين الكامل مجاناً
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.85 }}>
                  سجّل بريدك وسنُرسل لك مراجعة احترافية كاملة لسيرتك مع خطة تحسين مفصّلة خلال ٤٨ ساعة.
                </div>
                <Link to="/#signup" onClick={e => {
                  e.preventDefault()
                  navigate('/', { state: { scrollTo: 'signup' } })
                }} style={{
                  display: 'inline-block',
                  background: 'var(--gold500)', color: 'var(--g950)',
                  padding: '14px 36px', borderRadius: 50,
                  fontSize: 15, fontWeight: 700, textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold400)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gold500)'}>
                  سجّل واحصل على التحسين الكامل ←
                </Link>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </>
  )
}
