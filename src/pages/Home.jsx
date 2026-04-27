import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { CheckCircle, FileText, Briefcase, Lightbulb, ArrowLeft, Clock } from 'lucide-react'
import JobCard from '../components/JobCard.jsx'
import GovJobCard from '../components/GovJobCard.jsx'
import JobSkeleton from '../components/JobSkeleton.jsx'
import ApplyModal from '../components/ApplyModal.jsx'
import JobStructuredData from '../components/JobStructuredData.jsx'
import FilterBar from '../components/FilterBar.jsx'
import FeaturedCarousel from '../components/FeaturedCarousel.jsx'
import { JOBS as FALLBACK_JOBS, TIPS as FALLBACK_TIPS, CATEGORIES } from '../data'
import { jobsApi, tipsApi, subscribersApi } from '../services/api'
import { normalizeJob } from '../utils/normalizeJob.js'
import { useFadeIn } from '../hooks/useFadeIn'
import AnimatedNumber from '../components/AnimatedNumber.jsx'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { translations } from '../data/translations'


function normalizeTip(tip) {
  return {
    id: tip.id,
    category: tip.category_label || tip.category,
    title: tip.title,
    excerpt: tip.excerpt,
    readTime: '5 دقائق',
    tag: '',
    slug: tip.slug,
  }
}

/* ── Reveal hook ─────────────────────────── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1, rootMargin:'0px 0px -40px 0px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, vis] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      ...style
    }}>{children}</div>
  )
}

function PainPointCard() {
  const [ref, vis] = useReveal()
  const circumference = 2 * Math.PI * 40 // r=40
  const offset = circumference - (75 / 100) * circumference
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
      background:'linear-gradient(135deg,rgba(197,160,89,0.12) 0%,rgba(0,102,68,0.18) 100%)',
      border:'1px solid rgba(197,160,89,0.2)',
      borderRadius:20, padding:'28px 24px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:14,
      backdropFilter:'blur(8px)',
    }}>
      <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
        <circle cx="55" cy="55" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
        <circle cx="55" cy="55" r="40" fill="none"
          stroke="url(#painGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={vis ? offset : circumference}
          transform="rotate(-90 55 55)"
          style={{ transition: vis ? 'stroke-dashoffset 1.6s cubic-bezier(0.19,1,0.22,1) 0.3s' : 'none' }}
        />
        <defs>
          <linearGradient id="painGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--gold400)"/>
            <stop offset="100%" stopColor="var(--gold600)"/>
          </linearGradient>
        </defs>
        <text x="55" y="50" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--white)" fontFamily="Plus Jakarta Sans">75</text>
        <text x="55" y="68" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--gold400)" fontFamily="Plus Jakarta Sans">%</text>
      </svg>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--gold300)', letterSpacing:'0.5px', marginBottom:4 }}>نقطة الألم</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>من السير الذاتية تُرفض آلياً قبل أن يراها أحد</div>
      </div>
    </div>
  )
}

function StatItem({ val, prefix = '', accent, label }) {
  const [ref, vis] = useReveal()
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
    }}>
      <div style={{ fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:800, color:'var(--white)', lineHeight:1, marginBottom:6, fontFamily:'var(--font-en)' }}>
        {prefix}<AnimatedNumber target={val} arabic={false} /><span style={{ color:'var(--gold400)' }}>{accent}</span>
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{label}</div>
    </div>
  )
}

/* ── SVG Technical Timeline ─────────────────────────────────────── */
const TIMELINE_STEPS = [
  { n:'01', title:'سجّل مجاناً',       desc:'أنشئ حسابك في دقيقة وأخبرنا عن تخصصك وأهدافك المهنية',           icon:'◎' },
  { n:'02', title:'حسّن سيرتك',        desc:'ارفع ملفك واحصل على تحليل آلي فوري وتوصيات احترافية مخصّصة',    icon:'◈' },
  { n:'03', title:'اكتشف الفرص',       desc:'تصفّح آلاف الوظائف الموثّقة المناسبة لمجالك ومستوى خبرتك',      icon:'◉' },
  { n:'04', title:'احصل على وظيفتك',   desc:'قدّم بثقة مع دعم كامل في كل خطوة حتى تحصل على عرض التعيين',   icon:'◆' },
]

function SvgTimeline() {
  const [activeStep, setActiveStep] = useState(-1)
  const [ref, vis] = useReveal()

  useEffect(() => {
    if (!vis) return
    let i = 0
    const t = setInterval(() => { setActiveStep(i); i++; if (i >= TIMELINE_STEPS.length) clearInterval(t) }, 350)
    return () => clearInterval(t)
  }, [vis])

  return (
    <div ref={ref} style={{ position:'relative', padding:'0 0 8px' }}>
      {/* SVG connector line — desktop */}
      <svg
        aria-hidden="true"
        viewBox="0 0 900 60"
        preserveAspectRatio="none"
        style={{ position:'absolute', top:30, left:0, right:0, width:'100%', height:60, pointerEvents:'none', zIndex:0, display:'block' }}
      >
        <defs>
          <linearGradient id="timelineGrad" x1="100%" y1="0" x2="0%" y2="0">
            <stop offset="0%" stopColor="var(--g200)" />
            <stop offset="50%" stopColor="var(--gold500)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--g800)" />
          </linearGradient>
        </defs>
        {/* Base hairline */}
        <line x1="80" y1="30" x2="820" y2="30" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
        {/* Animated fill */}
        <line
          x1="80" y1="30" x2="820" y2="30"
          stroke="url(#timelineGrad)" strokeWidth="1"
          strokeDasharray="740"
          strokeDashoffset={vis ? 0 : 740}
          style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.32,0.72,0,1) 0.2s' }}
        />
        {/* Tick marks at each step */}
        {[80, 326, 574, 820].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="22" x2={x} y2="38" stroke={activeStep >= i ? 'var(--g700)' : 'rgba(0,0,0,0.12)'} strokeWidth="0.5"
              style={{ transition:'stroke 0.3s ease' }} />
          </g>
        ))}
      </svg>

      {/* Step cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap:20, position:'relative', zIndex:1 }}>
        {TIMELINE_STEPS.map(({ n, title, desc, icon }, i) => {
          const isActive = activeStep >= i
          return (
            <div
              key={n}
              onMouseEnter={() => setActiveStep(Math.max(activeStep, i))}
              style={{
                opacity: isActive ? 1 : 0.35,
                transform: isActive ? 'translateY(0)' : 'translateY(10px)',
                transition:`opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                background:'var(--white)',
                border:`0.5px solid ${isActive ? 'rgba(0,61,43,0.18)' : 'rgba(0,0,0,0.06)'}`,
                borderRadius:16,
                padding:'28px 24px 24px',
                boxShadow: isActive
                  ? '0 4px 24px rgba(0,61,43,0.07), 0 1px 3px rgba(0,0,0,0.04)'
                  : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Step number + icon */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{
                  fontFamily:'var(--font-en)', fontSize:10, fontWeight:700, letterSpacing:'2px',
                  color: isActive ? 'var(--g600)' : 'var(--gray400)',
                  transition:'color 0.4s ease',
                }}>{n}</div>
                <div style={{ flex:1, height:'0.5px', background: isActive ? 'var(--g200)' : 'rgba(0,0,0,0.06)', transition:'background 0.4s ease' }} />
                <div style={{
                  fontSize:20, lineHeight:1,
                  color: isActive ? (i === 3 ? 'var(--gold600)' : 'var(--g700)') : 'var(--gray300)',
                  transition:'color 0.4s ease',
                }}>{icon}</div>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color: isActive ? 'var(--g950)' : 'var(--gray400)', marginBottom:8, transition:'color 0.4s ease' }}>{title}</div>
              <div style={{ fontSize:12.5, color:'var(--gray500)', lineHeight:1.8 }}>{desc}</div>
              {/* Bottom accent */}
              <div style={{
                marginTop:20, height:'1px',
                background: isActive
                  ? i === 3 ? 'linear-gradient(90deg,var(--gold400),transparent)' : 'linear-gradient(90deg,var(--g300),transparent)'
                  : 'transparent',
                transition:'background 0.5s ease',
              }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepCard({ n, title, desc, numBg, numColor, numBorder }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:'var(--white)',
        border:`1.5px solid ${hovered ? 'var(--g300)' : 'var(--gray200)'}`,
        borderRadius:20,
        padding:'28px 20px 24px',
        textAlign:'center',
        boxShadow: hovered ? 'var(--shadow-lg)' : '0 4px 16px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition:'all 0.35s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      <div style={{
        width:60, height:60, borderRadius:'50%',
        background:numBg, border:`2px solid ${numBorder}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, fontWeight:800, color:numColor,
        margin:'0 auto 20px', fontFamily:'var(--font-en)',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
        transition:'box-shadow 0.35s ease',
      }}>{n}</div>
      <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:13, color:'var(--gray600)', lineHeight:1.8 }}>{desc}</div>
    </div>
  )
}

/* ── Resume Progress Bar ────────────────────── */
const RESUME_STAGES = ['رفع السيرة', 'التحليل الآلي', 'المراجعة', 'التقرير']

function ResumeProgressBar({ visible }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (!visible) { setActive(0); return }
    const interval = setInterval(() => {
      setActive(a => (a < RESUME_STAGES.length - 1 ? a + 1 : a))
    }, 600)
    return () => clearInterval(interval)
  }, [visible])

  return (
    <div style={{ marginTop:20, marginBottom:4 }}>
      <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:10, letterSpacing:'0.5px' }}>
        مراحل مراجعة ملفك
      </div>
      {/* Track */}
      <div style={{ position:'relative', height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, marginBottom:12 }}>
        <div style={{
          position:'absolute', top:0, right:0, height:'100%', borderRadius:2,
          background:'linear-gradient(90deg, var(--gold300), var(--gold500))',
          width: `${(active / (RESUME_STAGES.length - 1)) * 100}%`,
          transition:'width 0.5s cubic-bezier(0.32,0.72,0,1)',
        }} />
      </div>
      {/* Stage labels */}
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        {RESUME_STAGES.map((s, i) => (
          <div key={s} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{
              width:18, height:18, borderRadius:'50%',
              background: i <= active ? 'var(--gold500)' : 'rgba(255,255,255,0.15)',
              border: i <= active ? '2px solid var(--gold300)' : '2px solid rgba(255,255,255,0.1)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.4s ease', fontSize:9, color: i <= active ? 'var(--g950)' : 'transparent',
              fontWeight:700,
            }}>{i <= active ? '✓' : ''}</div>
            <span style={{ fontSize:9.5, color: i <= active ? 'var(--gold300)' : 'rgba(255,255,255,0.3)', fontWeight: i <= active ? 600 : 400, whiteSpace:'nowrap', transition:'color 0.4s' }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Mini Saudi Arabia Map ──────────────────── */
const SA_CITIES = [
  { id:'riyadh',  label:'الرياض',  x:60, y:50, emoji:'🏙️' },
  { id:'jeddah',  label:'جدة',     x:24, y:60, emoji:'🌊' },
  { id:'neom',    label:'نيوم',    x:18, y:28, emoji:'🔮' },
  { id:'dammam',  label:'الدمام',  x:80, y:44, emoji:'⚡' },
  { id:'makkah',  label:'مكة',     x:26, y:54, emoji:'🕋' },
]

function CityMap({ activeLocation, onSelect }) {
  const [open, setOpen] = useState(false)
  const [mapHovered, setMapHovered] = useState(null)

  return (
    <div style={{ marginBottom:20 }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'7px 16px', borderRadius:50, marginBottom:12,
          border:'1.5px solid var(--gray200)', background:'var(--white)',
          fontSize:13, fontWeight:600, color:'var(--g700)',
          cursor:'pointer', transition:'all 0.2s',
          fontFamily:'var(--font-ar)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--g400)'; e.currentTarget.style.background='var(--g50)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray200)'; e.currentTarget.style.background='var(--white)' }}
      >
        <span style={{ fontSize:15 }}>🗺️</span>
        استكشف الوظائف حسب المدينة
        <span style={{ fontSize:10, transition:'transform 0.25s', display:'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Collapsible panel */}
      <div style={{
        overflow:'hidden',
        maxHeight: open ? 340 : 0,
        opacity: open ? 1 : 0,
        transition:'max-height 0.45s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease',
      }}>
        <div style={{
          background:'var(--white)', border:'1px solid rgba(0,0,0,0.07)',
          borderRadius:16, padding:'20px 24px',
          display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-start',
          boxShadow:'0 4px 24px rgba(0,61,43,0.06)',
        }}>
          {/* SVG Map */}
          <div style={{ flex:'0 0 auto', width:200, position:'relative' }}>
            <svg viewBox="0 0 100 90" style={{ width:'100%', overflow:'visible' }} aria-hidden="true">
              {/* Simplified Saudi Arabia polygon */}
              <polygon
                points="28,8 50,5 68,8 80,14 88,22 90,35 86,50 80,62 70,74 58,82 44,80 32,72 22,62 18,50 16,36 18,22"
                fill="rgba(0,102,68,0.05)" stroke="rgba(0,102,68,0.2)" strokeWidth="1" strokeLinejoin="round"
              />
              {/* Red Sea rough line on the left */}
              <path d="M18,22 Q12,40 16,62" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="2.5" strokeLinecap="round"/>

              {SA_CITIES.map(c => {
                const isActive = activeLocation === c.label
                const isHovered = mapHovered === c.id
                return (
                  <g key={c.id} onClick={() => onSelect(isActive ? '' : c.label)} style={{ cursor:'pointer' }}>
                    <circle cx={c.x} cy={c.y} r={isActive || isHovered ? 5 : 3.5}
                      fill={isActive ? 'var(--g700)' : isHovered ? 'var(--g500)' : 'var(--g300)'}
                      stroke={isActive ? 'var(--g900)' : 'var(--white)'}
                      strokeWidth={isActive ? 1.5 : 1}
                      style={{ transition:'all 0.2s', filter: isActive ? 'drop-shadow(0 0 4px rgba(0,102,68,0.5))' : 'none' }}
                      onMouseEnter={() => setMapHovered(c.id)}
                      onMouseLeave={() => setMapHovered(null)}
                    />
                    <text x={c.x} y={c.y - 7} textAnchor="middle" fontSize="5" fontWeight={isActive ? '700' : '500'}
                      fill={isActive ? 'var(--g900)' : 'var(--gray600)'} fontFamily="Noto Sans Arabic"
                      style={{ pointerEvents:'none' }}>
                      {c.label}
                    </text>
                    {isActive && (
                      <circle cx={c.x} cy={c.y} r={8} fill="none" stroke="var(--g400)" strokeWidth="1"
                        style={{ animation:'mapPulse 1.5s ease-out infinite' }} />
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* City chips */}
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', marginBottom:12, letterSpacing:'0.5px' }}>
              اختر مدينة للتصفية
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {SA_CITIES.map(c => {
                const isActive = activeLocation === c.label
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(isActive ? '' : c.label)}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6,
                      padding:'7px 14px', borderRadius:50, fontSize:13, fontWeight:600,
                      border:`1.5px solid ${isActive ? 'var(--g700)' : 'var(--gray200)'}`,
                      background: isActive ? 'var(--g900)' : 'var(--white)',
                      color: isActive ? 'var(--white)' : 'var(--gray600)',
                      cursor:'pointer', transition:'all 0.2s',
                      fontFamily:'var(--font-ar)',
                      boxShadow: isActive ? '0 2px 10px rgba(0,61,43,0.2)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor='var(--g400)'; e.currentTarget.style.background='var(--g50)' }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor='var(--gray200)'; e.currentTarget.style.background='var(--white)' }}}
                  >
                    {c.emoji} {c.label}
                  </button>
                )
              })}
              {activeLocation && (
                <button
                  onClick={() => onSelect('')}
                  style={{
                    padding:'7px 14px', borderRadius:50, fontSize:12, fontWeight:600,
                    border:'1.5px dashed var(--gray300)', background:'transparent',
                    color:'var(--gray400)', cursor:'pointer', fontFamily:'var(--font-ar)',
                    transition:'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color='var(--gray600)'; e.currentTarget.style.borderColor='var(--gray400)' }}
                  onMouseLeave={e => { e.currentTarget.style.color='var(--gray400)'; e.currentTarget.style.borderColor='var(--gray300)' }}
                >
                  × مسح الفلتر
                </button>
              )}
            </div>
            {activeLocation && (
              <div style={{ marginTop:12, fontSize:12, color:'var(--g700)', fontWeight:600 }}>
                ✓ تعرض الوظائف في: {activeLocation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Signup form ─────────────────────────── */
// ── Progressive Reveal helper ─────────────────
function RevealField({ show, children }) {
  return (
    <div style={{
      overflow:'hidden',
      maxHeight: show ? '120px' : '0px',
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'max-height 0.35s ease, opacity 0.3s ease, transform 0.3s ease',
    }}>
      {children}
    </div>
  )
}

function SignupForm({ id }) {
  const [form, setForm]     = useState({ name:'', email:'', field:'' })
  const [step, setStep]     = useState(1)   // 1=name, 2=email, 3=field+submit
  const [done, setDone]     = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.name.trim() || !form.email.includes('@')) return
    setLoading(true)
    try {
      await subscribersApi.subscribe({ name: form.name, email: form.email, field: form.field })
      setDone(true)
    } catch (err) {
      if (err.message?.includes('unique') || err.message?.includes('already')) setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width:'100%', padding:'13px 18px', marginBottom:12,
    border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)',
    fontSize:15, fontFamily:'var(--font-ar)',
    color:'var(--gray800)', background:'var(--gray50)',
    outline:'none', textAlign:'right', direction:'rtl',
  }

  const onNameBlur = () => { if (form.name.trim().length >= 2) setStep(s => Math.max(s, 2)) }
  const onEmailBlur = () => { if (form.email.includes('@') && form.email.includes('.')) setStep(s => Math.max(s, 3)) }

  return (
    <div id={id} style={{
      background:'var(--white)', border:'1.5px solid var(--gray200)',
      borderRadius:'var(--r-xl)', padding:'clamp(24px,4vw,36px) clamp(24px,4vw,40px)',
      width:'100%', maxWidth:500, boxShadow:'var(--shadow-lg)', marginBottom:32,
    }}>
      <div style={{ fontSize:16, fontWeight:600, color:'var(--g900)', marginBottom:6 }}>
        احصل على تحسين سيرتك الذاتية مجاناً
      </div>
      <div style={{ fontSize:13, color:'var(--gray400)', marginBottom:20 }}>
        سجّل ببريدك الإلكتروني واحصل على مراجعة احترافية خلال 48 ساعة
      </div>

      {!done ? (
        <>
          {/* Step 1: الاسم — دائماً ظاهر */}
          <input type="text" placeholder="اسمك الكريم"
            value={form.name}
            onChange={e => setForm(p=>({...p,name:e.target.value}))}
            onBlur={onNameBlur}
            onKeyDown={e => e.key==='Enter' && onNameBlur()}
            style={inputStyle}
            autoComplete="name"
            onFocus={e=>{e.target.style.borderColor='var(--g600)';e.target.style.background='var(--white)'}}
          />

          {/* Step 2: البريد — يظهر بعد إدخال الاسم */}
          <RevealField show={step >= 2}>
            <input type="email" placeholder="بريدك الإلكتروني"
              value={form.email}
              onChange={e => setForm(p=>({...p,email:e.target.value}))}
              onBlur={onEmailBlur}
              onKeyDown={e => e.key==='Enter' && onEmailBlur()}
              style={inputStyle}
              autoComplete="email"
              autoFocus={step === 2}
              onFocus={e=>{e.target.style.borderColor='var(--g600)';e.target.style.background='var(--white)'}}
            />
          </RevealField>

          {/* Step 3: المجال + زر الإرسال — يظهر بعد إدخال البريد */}
          <RevealField show={step >= 3}>
            <select value={form.field} onChange={e=>setForm(p=>({...p,field:e.target.value}))}
              style={{ ...inputStyle, cursor:'pointer', appearance:'none' }}>
              <option value="" disabled>مجالك المهني</option>
              {['تقنية المعلومات','المالية والمحاسبة','الموارد البشرية','الهندسة','التسويق والمبيعات','الصحة','التعليم','أخرى'].map(o=>(
                <option key={o}>{o}</option>
              ))}
            </select>
            <button onClick={submit} disabled={loading} style={{
              width:'100%', padding:14, marginTop:4,
              background: loading ? 'var(--g600)' : 'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:600, transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.background='var(--g700)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(197,160,89,0.22), 0 6px 24px rgba(197,160,89,0.18)' }}}
            onMouseLeave={e=>{ if(!loading){ e.currentTarget.style.background='var(--g900)'; e.currentTarget.style.boxShadow='none' }}}>
              {loading ? '...جارٍ التسجيل' : 'احصل على تحسين سيرتك مجاناً ←'}
            </button>
          </RevealField>

          {/* progress dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:16 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                width: step >= n ? 20 : 6, height:6, borderRadius:3,
                background: step >= n ? 'var(--g700)' : 'var(--gray200)',
                transition:'all 0.3s ease',
              }}/>
            ))}
          </div>
          <p style={{ fontSize:12, color:'var(--gray400)', textAlign:'center', marginTop:10 }}>
            لا رسائل مزعجة · يمكنك إلغاء الاشتراك في أي وقت · خصوصيتك محفوظة
          </p>
        </>
      ) : (
        <div style={{
          background:'var(--g50)', border:'1px solid var(--g200)',
          borderRadius:'var(--r-md)', padding:'16px 20px',
          display:'flex', alignItems:'center', gap:12,
          color:'var(--g700)', fontWeight:500, fontSize:14,
        }}>
          <CheckCircle size={20} style={{ flexShrink:0 }} />
          تم التسجيل! سنتواصل معك خلال 48 ساعة بمراجعة سيرتك الذاتية.
        </div>
      )}
    </div>
  )
}

/* ── Main Page ───────────────────────────── */
function ConsentBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('consent_analytics'))
  const [mounted, setMounted] = useState(false)
  useEffect(() => { if (visible) setTimeout(() => setMounted(true), 100) }, [visible])

  const dismiss = (accepted) => {
    localStorage.setItem('consent_analytics', accepted ? 'true' : 'false')
    if (accepted) document.dispatchEvent(new Event('consent:granted'))
    setMounted(false)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null
  return (
    <div style={{
      position:'fixed', bottom:20, left:'50%',
      zIndex:9999, width:'calc(100% - 32px)', maxWidth:480,
      background:'linear-gradient(135deg,var(--g950) 0%,var(--g900) 100%)',
      color:'#fff', borderRadius:16,
      padding:'16px 20px',
      boxShadow:'0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,61,43,0.3)',
      border:'1px solid rgba(197,160,89,0.18)',
      direction:'rtl', fontFamily:'var(--font-ar)',
      opacity: mounted ? 1 : 0,
      transform: mounted ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      transition:'opacity 0.4s var(--ease-expo), transform 0.4s var(--ease-expo)',
    }}>
      <p style={{ fontSize:13, lineHeight:1.7, color:'rgba(255,255,255,0.85)', margin:'0 0 12px' }}>
        نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل الزيارات.{' '}
        <Link to="/privacy" style={{ color:'var(--gold300)', textDecoration:'underline', fontSize:12 }}>
          سياسة الخصوصية
        </Link>
      </p>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => dismiss(true)} style={{
          flex:1, background:'linear-gradient(135deg,var(--gold500),var(--gold400))',
          color:'var(--g950)', border:'none', padding:'9px 0', borderRadius:50,
          fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--font-ar)',
        }}
        onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          قبول
        </button>
        <button onClick={() => dismiss(false)} style={{
          flex:1, background:'transparent', color:'rgba(255,255,255,0.6)',
          border:'1px solid rgba(255,255,255,0.2)', padding:'9px 0', borderRadius:50,
          fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'var(--font-ar)',
        }}
        onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.9)'}
        onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
          رفض
        </button>
      </div>
    </div>
  )
}

const EMPTY_FILTERS = { q: '', location: '', category: '', job_type: '', experience_level: '', salary_min: '', salary_max: '' }

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

export default function Home() {
  const { lang } = useLanguage()
  const { theme } = useTheme()
  const t = translations[lang].hero
  const [selectedJob, setSelectedJob] = useState(null)
  const [bottomSheetJob, setBottomSheetJob] = useState(null)
  const [jobs, setJobs] = useState(FALLBACK_JOBS)
  const [govJobs, setGovJobs] = useState([])
  const [tips, setTips] = useState(FALLBACK_TIPS)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(1)
  const sentinelRef = useRef(null)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState(() => ({
    q: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    job_type: searchParams.get('job_type') || '',
    experience_level: searchParams.get('experience_level') || '',
    salary_min: searchParams.get('salary_min') || '',
    salary_max: searchParams.get('salary_max') || '',
  }))

  const debouncedFilters = useDebounce(filters, 400)

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
    const params = {}
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v })
    setSearchParams(params, { replace: true })
  }

  // تنفيذ الـ scroll عند الوصول من صفحة أخرى عبر navigate('/', { state: { scrollTo: id } })
  useEffect(() => {
    const id = location.state?.scrollTo
    if (!id) return
    const attempt = (tries = 0) => {
      const el = document.getElementById(id)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }) }
      else if (tries < 5) { setTimeout(() => attempt(tries + 1), 120) }
    }
    attempt()
  }, [location.state])

  // WebPage + BreadcrumbList JSON-LD — يستهدف وظائف الرياض، توطين، تقنية
  useEffect(() => {
    const id = 'webpage-structured-data'
    const prev = document.getElementById(id)
    if (prev) prev.remove()
    const s = document.createElement('script')
    s.id = id
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'وظائف السعودية — فرص أرامكو ونيوم وPIF | Saudi Careers',
      url: 'https://saudicareers.site',
      description: 'وظائف الرياض وجدة والمنطقة الشرقية، توطين رؤية 2030، وظائف تقنية وهندسية وإدارية',
      keywords: 'وظائف الرياض، وظائف تقنية، توطين، وظائف شاغرة السعودية، وظائف 2030، وظائف أرامكو، وظائف نيوم، وظائف PIF',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://saudicareers.site' },
          { '@type': 'ListItem', position: 2, name: 'وظائف السعودية', item: 'https://saudicareers.site/#jobs' },
        ],
      },
    })
    document.head.appendChild(s)
    return () => { document.getElementById(id)?.remove() }
  }, [])

  const loadPage = useCallback(async (pageNum, reset) => {
    if (reset) setLoadingJobs(true)
    else setLoadingMore(true)
    const params = { per_page: 12, page: pageNum }
    Object.entries(debouncedFilters).forEach(([k, v]) => { if (v) params[k] = v })
    try {
      const res = await jobsApi.getAll(params)
      const apiJobs = res?.data
      if (Array.isArray(apiJobs)) {
        const mapped = apiJobs.map(normalizeJob)
        if (reset) setJobs(mapped.length > 0 ? mapped : [])
        else setJobs(p => [...p, ...mapped])
        const lastPage = res?.meta?.last_page ?? (apiJobs.length < 12 ? pageNum : pageNum + 1)
        setHasMore(pageNum < lastPage)
      }
    } catch { /* keep fallback */ }
    finally { reset ? setLoadingJobs(false) : setLoadingMore(false) }
  }, [debouncedFilters])

  // Reset on filter change
  useEffect(() => {
    pageRef.current = 1
    setHasMore(true)
    loadPage(1, true)
  }, [loadPage])

  // Intersection Observer sentinel
  useEffect(() => {
    if (!hasMore || loadingMore) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        pageRef.current += 1
        loadPage(pageRef.current, false)
      }
    }, { rootMargin: '0px 0px 300px 0px', threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, loadPage])

  useEffect(() => {
    jobsApi.getAll({ gov_partner: 1 })
      .then(res => {
        const data = res?.data
        if (Array.isArray(data) && data.length > 0) {
          setGovJobs(data.map(normalizeJob))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    tipsApi.getAll({ per_page: 6 })
      .then(res => {
        const apiTips = res?.data
        if (Array.isArray(apiTips) && apiTips.length > 0) {
          setTips(apiTips.map(normalizeTip))
        }
      })
      .catch(() => {/* keep fallback */})
  }, [])

  const heroHeadingRef = useFadeIn()
  const heroDescRef = useFadeIn()

  const sectionTitle = { fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:700, color:'var(--g950)', lineHeight:1.25, marginBottom:14, letterSpacing:'-0.4px' }
  const sectionSub = { fontSize:'1rem', color:'var(--gray600)', maxWidth:540, lineHeight:1.85, marginBottom:48 }
  const eyebrow = { display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--gold600)', marginBottom:14 }

  return (
    <>
      <ConsentBanner />
      {/* ── HERO ── */}
      <section className="hero-section" style={{
        minHeight: '100vh',
        padding: '120px clamp(1rem,4vw,3rem) 80px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse 80% 50% at 50% -5%, ${theme === 'dark' ? 'rgba(212,237,224,0.03)' : 'rgba(0,61,43,0.06)'} 0%, transparent 65%), var(--page-bg)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, transparent, var(--g700) 40%, var(--gold500) 70%, transparent)' }} />

        <div style={{
          maxWidth:1160, width:'100%', margin:'0 auto',
          display:'grid', gridTemplateColumns:'minmax(320px,1fr) minmax(320px,1.15fr)',
          gap:'clamp(32px,5vw,64px)', alignItems:'center',
        }} className="hero-grid">

          {/* RIGHT COLUMN (RTL first): copy */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
            {/* Early access badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--white)', color:'var(--g800)',
              border:'0.5px solid rgba(0,61,43,0.15)',
              padding:'5px 16px 5px 12px', borderRadius:50,
              fontSize:13, fontWeight:500, marginBottom:28,
              boxShadow:'0 1px 8px rgba(0,61,43,0.06), 0 0.5px 2px rgba(0,0,0,0.04)',
            }}>
              <span style={{ width:7, height:7, background:'var(--g600)', borderRadius:'50%', animation:'pulse 2s infinite', display:'block' }} />
              {t.badge}
            </div>

            {/* Heading */}
            <h1 ref={heroHeadingRef} className="fade-in-section" style={{
              fontSize:'clamp(1.9rem,5.5vw,3.4rem)', fontWeight:700, lineHeight:1.22,
              color:'var(--g950)', marginBottom:20, letterSpacing:'-0.6px',
              fontFamily: lang === 'ar' ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
              {t.title}
            </h1>

            {/* Description */}
            <p ref={heroDescRef} className="fade-in-section delay-1" style={{
              fontSize:'clamp(1rem,1.6vw,1.1rem)', color:'var(--gray800)',
              maxWidth:480, marginBottom:36, lineHeight:2, fontWeight:400,
              letterSpacing:'0.01em',
            }}>
              {t.subtitle}
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:32 }}>
              <Link to="/resume-analyzer" data-track="hero_cta" style={{
                background:'linear-gradient(135deg,var(--g900) 0%,var(--g700) 100%)', color:'var(--white)',
                padding:'14px 30px', borderRadius:'var(--r-md)',
                fontSize:15, fontWeight:700, textDecoration:'none',
                transition:'all 0.25s var(--ease-pop)',
                boxShadow:'0 6px 24px rgba(0,61,43,0.28), 0 2px 6px rgba(197,160,89,0.18)',
                minHeight:48,
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(0,61,43,0.32), 0 4px 12px rgba(197,160,89,0.22)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 6px 24px rgba(0,61,43,0.28), 0 2px 6px rgba(197,160,89,0.18)'}}
              onMouseDown={e=>e.currentTarget.style.transform='translateY(0) scale(0.97)'}
              onMouseUp={e=>e.currentTarget.style.transform='translateY(-2px) scale(1)'}>
                {t.resume_cta}
              </Link>
              <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior:'smooth' })} style={{
                background:'transparent', color:'var(--g900)',
                padding:'14px 28px', borderRadius:'var(--r-md)',
                fontSize:15, fontWeight:600,
                border:'2px solid var(--g900)',
                cursor:'pointer', minHeight:48,
                transition:'all 0.25s var(--ease-pop)',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--g900)';e.currentTarget.style.color='var(--white)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--g900)'}}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.97)'}
              onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                {t.search_btn}
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:'var(--gray400)' }}>
              <div style={{ display:'flex', direction:'ltr' }}>
                {['أح','سم','عب','+'].map((t,i) => (
                  <div key={i} style={{
                    width:28, height:28, borderRadius:'50%', border:'2px solid #F5F5F7',
                    marginRight:-8, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:700,
                    background: i===3 ? 'var(--g900)' : ['var(--g100)','var(--gold100)','var(--g200)'][i],
                    color: i===3 ? 'var(--white)' : ['var(--g800)','var(--gold700)','var(--g900)'][i],
                  }}>{t}</div>
                ))}
              </div>
              <span>{lang === 'ar' ? 'انضم أكثر من ' : 'Join over '}<strong style={{ color:'var(--g800)' }}>120+</strong> {lang === 'ar' ? 'محترف' : 'professionals'}</span>
            </div>
          </div>

          {/* LEFT COLUMN: resume composition with animated badges */}
          <div aria-hidden="true" style={{ position:'relative', width:'100%', aspectRatio:'4/3', maxHeight:560 }}>
            {/* Resume base card */}
            <div style={{
              position:'absolute', inset:'4% 6% 8% 6%',
              borderRadius:20, overflow:'hidden',
              boxShadow:'0 24px 60px rgba(0,61,43,0.15), 0 4px 14px rgba(0,0,0,0.06)',
              background:'var(--white)',
              animation:'heroFloat 7s ease-in-out infinite',
              transform:'rotate(-1.5deg)',
              padding:'28px 24px',
            }}>
              {/* CV Header row */}
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, paddingBottom:16, borderBottom:'1.5px solid var(--gray100)' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,var(--g200),var(--g100))', flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:11, background:'var(--g950)', borderRadius:4, width:'60%', marginBottom:6 }} />
                  <div style={{ height:8, background:'var(--gray200)', borderRadius:4, width:'45%' }} />
                </div>
              </div>
              {/* CV content lines */}
              {[['60%','75%','55%'],['90%','65%','50%'],['70%','80%','40%']].map((widths,gi) => (
                <div key={gi} style={{ marginBottom:14 }}>
                  <div style={{ height:7, background: gi===0?'var(--gold100)':'var(--g50)', borderRadius:3, width:gi===0?'38%':'30%', marginBottom:7 }} />
                  {widths.map((w,i) => (
                    <div key={i} style={{ height:6, background: i===0?'var(--g100)':'var(--gray100)', borderRadius:3, width:w, marginBottom:5 }} />
                  ))}
                </div>
              ))}
              {/* Skill chips */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                {[['var(--g50)','var(--g200)',52],['var(--gold100)','var(--gold300)',64],['var(--gray100)','var(--gray200)',44],['var(--g50)','var(--g100)',56]].map(([bg,border,w],i) => (
                  <div key={i} style={{ height:20, width:w, borderRadius:10, background:bg, border:`1px solid ${border}` }} />
                ))}
              </div>
            </div>

            {/* Target badge — top-end */}
            <div style={{
              position:'absolute', top:'18%', insetInlineEnd:'-2%',
              width:86, height:86, borderRadius:22,
              background:'linear-gradient(135deg,var(--g50) 0%,var(--g100) 100%)',
              border:'1px solid var(--g200)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 12px 32px rgba(0,61,43,0.14)',
              animation:'heroBadge1 5s ease-in-out infinite',
            }}>
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--g700)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="var(--g700)"/>
              </svg>
            </div>

            {/* Score ring — start side */}
            <div style={{
              position:'absolute', top:'38%', insetInlineStart:'-4%',
              width:150, height:150, borderRadius:'50%',
              background:'var(--white)',
              boxShadow:'0 16px 40px rgba(0,61,43,0.16)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'heroBadge2 6s ease-in-out infinite',
            }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="62" fill="none" stroke="var(--gray100)" strokeWidth="11" />
                <circle cx="75" cy="75" r="62" fill="none" stroke="var(--g600)" strokeWidth="11" strokeLinecap="round"
                  strokeDasharray="390" strokeDashoffset="56" transform="rotate(-90 75 75)">
                  <animate attributeName="stroke-dashoffset" from="390" to="56" dur="2.5s" fill="freeze" />
                </circle>
                <text x="75" y="70" textAnchor="middle" dominantBaseline="central"
                  fontSize="34" fontWeight="800" fill="var(--g950)" fontFamily="Plus Jakarta Sans">85</text>
                <text x="75" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--gray600)" fontFamily="Noto Sans Arabic">المعدل: جيد جداً</text>
              </svg>
            </div>

            {/* Suggestions pill — bottom */}
            <div style={{
              position:'absolute', bottom:'4%', insetInlineEnd:'14%',
              display:'inline-flex', alignItems:'center', gap:12,
              background:'var(--white)',
              padding:'12px 22px 12px 12px', borderRadius:50,
              boxShadow:'0 12px 32px rgba(0,61,43,0.14)',
              animation:'heroBadge3 5.5s ease-in-out infinite',
            }}>
              <span style={{
                width:34, height:34, borderRadius:'50%',
                background:'var(--g700)', color:'var(--white)',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                fontSize:18, fontWeight:700,
              }}>!</span>
              <span style={{ fontSize:15, fontWeight:700, color:'var(--g950)', whiteSpace:'nowrap' }}>
                <span style={{ fontFamily:'var(--font-en)', color:'var(--gold600)' }}>4</span> اقتراحات للتحسين
              </span>
            </div>

            {/* Sparkle dot */}
            <div style={{
              position:'absolute', top:'8%', insetInlineStart:'12%',
              width:10, height:10, borderRadius:'50%', background:'var(--gold500)',
              boxShadow:'0 0 0 4px rgba(197,160,89,0.18)',
              animation:'heroSpark 2.4s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{ background:'linear-gradient(160deg,var(--g950) 0%,var(--g900) 60%,var(--g800) 100%)', padding:'clamp(40px,6vw,64px) clamp(1rem,4vw,3rem)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32, alignItems:'center' }}>

          {/* Pain-point card: 75% with progress ring */}
          <PainPointCard />

          {[
            { val:2,  prefix:'+', accent:'م', label:'باحث عن عمل في السعودية' },
            { val:70, prefix:'', accent:'٪', label:'نسبة التوطين المستهدفة برؤية 2030' },
            { val:48, prefix:'', accent:'س', label:'لتحسين سيرتك الذاتية عند التسجيل' },
          ].map(({ val, prefix, accent, label }) => (
            <StatItem key={label} val={val} prefix={prefix} accent={accent} label={label} />
          ))}
        </div>
      </div>

      {/* ── JOBS ── */}
      <section style={{
        padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)',
        background:'var(--gray50)',
        position:'relative',
        backgroundImage:'radial-gradient(circle, rgba(0,61,43,0.055) 1px, transparent 1px)',
        backgroundSize:'28px 28px',
      }} id="jobs">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={eyebrow}><span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/> فرص موثوقة</div>
            <h2 style={sectionTitle}>أحدث الوظائف في السوق السعودي</h2>
            <p style={sectionSub}>نجمع الفرص الوظيفية من مصادرها الرسمية ونتحقق من صحتها قبل نشرها</p>
          </Reveal>

          <Reveal delay={80}>
            <FeaturedCarousel />
          </Reveal>

          {/* Government Partner Spotlight */}
          {govJobs.length > 0 && (
            <Reveal delay={90}>
              <div style={{ marginBottom:48 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <span style={{ fontSize:18 }}>🏛️</span>
                  <h3 style={{ fontSize:18, fontWeight:700, color:'var(--g950)', margin:0 }}>وظائف حكومية مميزة</h3>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50,
                    background:'rgba(0,102,68,0.08)', color:'#006644', border:'1px solid rgba(0,102,68,0.2)',
                    marginRight:'auto',
                  }}>شركاء حكوميون</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:20 }}>
                  {govJobs.map((job, i) => (
                    <GovJobCard
                      key={job.id}
                      job={job}
                      onApply={setSelectedJob}
                      onDetails={setBottomSheetJob}
                      onTagClick={tag => {
                        const cat = CATEGORIES.find(c => c.label === tag)
                        if (cat) {
                          handleFilterChange({ ...filters, category: cat.key })
                          document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                      delay={i * 60}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={100}>
            <CityMap
              activeLocation={filters.location}
              onSelect={city => handleFilterChange({ ...filters, location: city })}
            />
            <FilterBar filters={filters} onChange={handleFilterChange} />
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:20 }}>
            {loadingJobs
              ? Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)
              : jobs.length === 0
                ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 0' }}>
                    <div style={{ fontSize:15, color:'var(--gray400)', marginBottom:12 }}>لا توجد وظائف تطابق البحث</div>
                    {debouncedFilters.q && (() => {
                      const q = debouncedFilters.q
                      const suggestion = q.replace(/ة/g,'ه').replace(/ه$/,'ة').replace(/أ/g,'ا').replace(/ى$/,'ي')
                      return suggestion !== q ? (
                        <button onClick={() => handleFilterChange({...filters, q: suggestion})}
                          style={{ background:'none', border:'none', color:'var(--g600)', fontSize:14, cursor:'pointer', textDecoration:'underline' }}>
                          هل تقصد: {suggestion}؟
                        </button>
                      ) : null
                    })()}
                  </div>
                : jobs.map((job, i) => (
                    <Reveal key={job.id} delay={Math.min(i, 5) * 60}>
                      {job.is_government_partner ? (
                        <GovJobCard
                          job={job}
                          onApply={setSelectedJob}
                          onDetails={setBottomSheetJob}
                          onTagClick={tag => {
                            const cat = CATEGORIES.find(c => c.label === tag)
                            if (cat) {
                              handleFilterChange({ ...filters, category: cat.key })
                              document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                        />
                      ) : (
                        <JobCard
                          job={job}
                          onApply={setSelectedJob}
                          onDetails={setBottomSheetJob}
                          onTagClick={tag => {
                            const cat = CATEGORIES.find(c => c.label === tag)
                            if (cat) {
                              handleFilterChange({ ...filters, category: cat.key })
                              document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                        />
                      )}
                    </Reveal>
                  ))
            }
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} style={{ height:1 }} aria-hidden="true" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div style={{ textAlign:'center', padding:'32px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', border:'2.5px solid var(--g200)', borderTopColor:'var(--g700)', animation:'spin 0.7s linear infinite' }} />
              <span style={{ fontSize:13, color:'var(--gray400)' }}>جارٍ تحميل المزيد…</span>
            </div>
          )}

          {!loadingJobs && !loadingMore && !hasMore && jobs.length > 0 && (
            <div style={{ textAlign:'center', padding:'24px 0', fontSize:13, color:'var(--gray400)' }}>
              ✓ تم عرض جميع الوظائف المتاحة
            </div>
          )}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)' }} id="services">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={eyebrow}><span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/> خدماتنا</div>
            <h2 style={sectionTitle}>ثلاث خدمات، هدف واحد</h2>
            <p style={sectionSub}>صممنا كل خدمة لتكمّل الأخرى، لأن النجاح في سوق العمل يحتاج أكثر من مجرد CV جميل</p>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap:24 }}>
            {[
              { emoji:'📄', title:'تحسين السيرة الذاتية', desc:'مراجعة احترافية تضمن أن سيرتك تتجاوز أنظمة الفحص الآلي وتصل للمسؤولين الفعليين — مجاناً.', features:['توافق مع معايير ATS','صياغة بالعربية والإنجليزية','مراجعة خلال 48 ساعة'], tag:'مجاني عند التسجيل', tagGold:false, accent:'var(--gold400)', featured:true, delay:0, ctaLink:'/resume-analyzer', ctaText:'افحص سيرتك الذاتية مجاناً ✦' },
              { emoji:'💼', title:'وظائف ودورات موثّقة', desc:'نجمع الفرص من كبرى الشركات السعودية ونتحقق من مصداقيتها قبل نشرها.', features:['وظائف من نيوم وأرامكو وPIF','دورات معتمدة ومموّلة','تحديث يومي للفرص'], tag:'مصادر رسمية موثوقة', tagGold:true, accent:'var(--gold500)', featured:false, delay:100 },
              { emoji:'🎯', title:'نصائح مهنية موثوقة', desc:'محتوى مبني على أبحاث الموارد البشرية لبناء حضور مهني قوي في السوق السعودي.', features:['نصائح مقابلات الوظائف','تطوير ملف LinkedIn','مخصصة للسوق السعودي'], tag:'محتوى حصري', tagGold:false, accent:'var(--g400)', featured:false, delay:200 },
            ].map(({ emoji, title, desc, features, tag, tagGold, accent, featured, delay, ctaLink, ctaText }) => (
              <Reveal key={title} delay={delay}>
                <ServiceCard emoji={emoji} title={title} desc={desc} features={features} tag={tag} tagGold={tagGold} accent={accent} featured={featured} ctaLink={ctaLink} ctaText={ctaText} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background:'var(--gray50)' }} id="how">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <div style={{ ...eyebrow, justifyContent:'center' }}>
                <span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
                كيف يعمل
                <span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
              </div>
              <h2 style={{ ...sectionTitle, marginBottom:0 }}>كيف تعمل المنصة؟</h2>
            </div>
          </Reveal>
          <SvgTimeline />
        </div>
      </section>

      {/* ── TIPS ── */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background:'var(--g950)' }} id="tips">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={{ ...eyebrow, color:'var(--gold400)' }}><span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/> نصائح مهنية</div>
            <h2 style={{ ...sectionTitle, color:'var(--white)' }}>ارفع مستواك في سوق العمل</h2>
            <p style={{ ...sectionSub, color:'rgba(255,255,255,0.55)' }}>
              مقالات مبنية على أبحاث الموارد البشرية ومعطيات سوق العمل السعودي
            </p>
          </Reveal>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap:20 }}>
            {tips.map((tip, i) => (
              <Reveal key={tip.id} delay={i * 60}>
                <TipCard tip={tip} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background:'var(--g50)', textAlign:'center' }}>
        <div style={{ maxWidth:540, margin:'0 auto' }}>
          <Reveal>
            <div style={{ ...eyebrow, justifyContent:'center' }}>
              <span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
              انضم الآن
              <span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
            </div>
            <h2 style={{ ...sectionTitle, textAlign:'center' }}>كن أول من يعرف عند الإطلاق</h2>
            <p style={{ color:'var(--gray600)', marginBottom:36, fontSize:15, lineHeight:1.85 }}>
              سجّل الآن واحصل على وصول مبكر مجاني، ومراجعة سيرتك الذاتية، وتنبيهات بأحدث الوظائف.
            </p>
            <FooterSignupForm />
          </Reveal>
        </div>
      </section>

      {/* Apply Modal */}
      {selectedJob && <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      {/* Google Jobs Structured Data */}
      <JobStructuredData jobs={jobs} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes mapPulse { 0%{opacity:1;r:8} 100%{opacity:0;r:16} }
        @keyframes heroFloat  { 0%,100%{transform:rotate(-1.5deg) translateY(0px)} 50%{transform:rotate(-1.5deg) translateY(-10px)} }
        @keyframes heroBadge1 { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-8px) scale(1.02)} }
        @keyframes heroBadge2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes heroBadge3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes heroSpark  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes ringFill   { from{stroke-dashoffset:170} }
        .hero-grid { }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="heroFloat"],[style*="heroBadge"],[style*="heroSpark"] { animation: none !important; }
        }
      `}</style>

      {/* ── Bottom Sheet (Job Details) ── */}
      {bottomSheetJob && (
        <BottomSheet
          job={bottomSheetJob}
          onClose={() => setBottomSheetJob(null)}
          onApply={setSelectedJob}
        />
      )}
    </>
  )
}

/* ── Bottom Sheet ────────────────────────────────────────────────── */
function BottomSheet({ job, onClose, onApply }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // قفل التمرير خلف الـ Sheet
    document.body.style.overflow = 'hidden'
    // Double-RAF للـ slide-up animation
    let r1, r2
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setVisible(true))
    })
    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 420)
  }

  const handleApply = () => {
    setVisible(false)
    // تأخير بسيط لإغلاق الـ Sheet قبل فتح الـ Modal
    setTimeout(() => onApply(job), 420)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position:'fixed', inset:0, zIndex:400,
          background:'rgba(0,0,0,0.45)',
          backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)',
          opacity: visible ? 1 : 0,
          transition:'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div role="dialog" aria-modal="true" aria-label={`تفاصيل: ${job.title}`} style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:401,
        background:'var(--white)',
        borderRadius:'20px 20px 0 0',
        maxHeight:'88vh',
        overflowY:'auto',
        overscrollBehavior:'contain',
        WebkitOverflowScrolling:'touch',
        paddingBottom:'calc(env(safe-area-inset-bottom) + 24px)',
        boxShadow:'0 -8px 40px rgba(0,0,0,0.15)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition:'transform 0.42s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 6px' }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'var(--gray200)' }}/>
        </div>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 16px' }}>
          <button onClick={handleClose} style={{
            width:32, height:32, borderRadius:'50%',
            background:'var(--gray100)', border:'none',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', fontSize:20, lineHeight:1, color:'var(--gray500)',
            transition:'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='var(--gray200)'}
          onMouseLeave={e => e.currentTarget.style.background='var(--gray100)'}
          aria-label="إغلاق">×</button>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--g950)' }}>تفاصيل الوظيفة</span>
          <div style={{ width:32 }}/>
        </div>

        {/* Content */}
        <div style={{ padding:'0 20px' }}>
          {/* Company row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{
              width:52, height:52, borderRadius:'var(--r-sm)',
              background:'var(--g50)', border:'1px solid var(--g100)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:26, flexShrink:0,
            }}>{job.icon}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--g950)', lineHeight:1.3 }}>{job.title}</div>
              <div style={{ fontSize:14, color:'var(--g700)', fontWeight:600, marginTop:2 }}>{job.company}</div>
            </div>
          </div>

          {/* Meta pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
            {[job.location, job.type, `${job.salary} ر.س`].filter(Boolean).map(text => (
              <span key={text} style={{
                fontSize:12, padding:'5px 12px', borderRadius:50,
                background:'var(--g50)', color:'var(--g700)', fontWeight:500,
              }}>{text}</span>
            ))}
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
              {job.tags.map(t => (
                <span key={t} style={{
                  fontSize:11, fontWeight:500, padding:'4px 10px',
                  background:'var(--gray100)', color:'var(--gray600)', borderRadius:50,
                }}>{t}</span>
              ))}
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--g900)', marginBottom:10 }}>وصف الوظيفة</div>
              <p style={{
                fontSize:14, color:'var(--gray600)', lineHeight:1.85,
                display:'-webkit-box', WebkitLineClamp:8, WebkitBoxOrient:'vertical', overflow:'hidden',
                margin:0,
              }}>{job.description}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleApply}
            onPointerDown={e => e.currentTarget.style.transform='scale(0.97)'}
            onPointerUp={e => e.currentTarget.style.transform='scale(1)'}
            onPointerLeave={e => e.currentTarget.style.transform='scale(1)'}
            style={{
              width:'100%', padding:'14px 0',
              background:'linear-gradient(135deg, var(--g900) 0%, var(--g950) 100%)',
              color:'var(--white)', border:'none', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:700, cursor:'pointer',
              transition:'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            التقديم الآن ←
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ────────────────────── */
function ServiceCard({ emoji, title, desc, features, tag, tagGold, accent, featured = false, ctaLink, ctaText }) {
  const [hovered, setHovered] = useState(false)

  if (featured) {
    return (
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
        background: 'var(--g900)',
        border: `1.5px solid ${hovered ? 'rgba(197,160,89,0.5)' : 'rgba(197,160,89,0.2)'}`,
        borderRadius: 'var(--r-lg)', padding: '36px 32px',
        transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.25)' : '0 8px 32px rgba(0,0,0,0.15)',
        height: '100%', display:'flex', flexDirection:'column',
      }}>
        {/* شريط علوي ذهبي */}
        <div style={{ position:'absolute', top:0, insetInline:0, height:3, background:'linear-gradient(90deg, var(--gold500), var(--gold300))', borderRadius:'var(--r-lg) var(--r-lg) 0 0' }}/>
        {/* بادج "الأبرز" */}
        <div style={{ position:'absolute', top:18, insetInlineStart:18, display:'flex', alignItems:'center', gap:5, background:'rgba(197,160,89,0.15)', border:'1px solid rgba(197,160,89,0.35)', padding:'3px 12px', borderRadius:50, fontSize:11, fontWeight:700, color:'var(--gold400)', letterSpacing:'0.5px' }}>
          ★ الخدمة الرئيسية
        </div>
        <div style={{ fontSize:36, marginTop:28, marginBottom:20 }}>{emoji}</div>
        <div style={{ fontSize:20, fontWeight:700, color:'var(--white)', marginBottom:12 }}>{title}</div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.85, marginBottom:20 }}>{desc}</div>
        {features.map(f => (
          <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:8 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold400)', flexShrink:0 }}/>
            {f}
          </div>
        ))}

        {/* شريط تقدم مراحل مراجعة السيرة الذاتية */}
        <ResumeProgressBar visible={hovered} />

        <div style={{ marginTop:'auto', paddingTop:24, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          {ctaLink && (
            <Link to={ctaLink} style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'var(--gold500)', color:'var(--g950)',
              padding:'10px 22px', borderRadius:50,
              fontSize:13, fontWeight:700, textDecoration:'none',
              transition:'background 0.2s', flexShrink:0,
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--gold400)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--gold500)'}>
              {ctaText}
            </Link>
          )}
          <span style={{
            fontSize:12, fontWeight:700, padding:'6px 18px', borderRadius:50,
            background:'rgba(197,160,89,0.2)', color:'var(--gold300)',
            border:'1px solid rgba(197,160,89,0.3)',
          }}>{tag}</span>
        </div>
        <div style={{ position:'absolute', bottom:0, insetInline:0, height: hovered ? 4 : 3, background:accent, borderRadius:'0 0 var(--r-lg) var(--r-lg)', transition:'height 0.3s' }}/>
      </div>
    )
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background:'var(--white)', border:'1.5px solid var(--gray200)',
      borderRadius:'var(--r-lg)', padding:'32px 28px',
      transition:'all 0.3s', position:'relative', overflow:'hidden',
      transform: hovered ? 'translateY(-4px)' : 'none',
      boxShadow: hovered ? 'var(--shadow-lg)' : '0 8px 32px rgba(0,0,0,0.08)',
      height:'100%',
    }}>
      <div style={{ position:'absolute', bottom:0, insetInline:0, height: hovered ? 4 : 3, background:accent, borderRadius:'0 0 var(--r-lg) var(--r-lg)', transition:'height 0.3s' }}/>
      <div style={{ fontSize:28, marginBottom:20 }}>{emoji}</div>
      <div style={{ fontSize:18, fontWeight:700, color:'var(--g950)', marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--gray600)', lineHeight:1.8, marginBottom:18 }}>{desc}</div>
      {features.map(f => (
        <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--gray600)', marginBottom:6 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--g500)', flexShrink:0 }}/>
          {f}
        </div>
      ))}
      <span style={{
        marginTop:20, display:'inline-block',
        fontSize:12, fontWeight:600, padding:'5px 14px', borderRadius:50,
        background: tagGold ? 'var(--gold100)' : 'var(--g50)',
        color: tagGold ? 'var(--gold700)' : 'var(--g700)',
      }}>{tag}</span>
    </div>
  )
}

function TipCard({ tip }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: hovered ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
      border: hovered ? '1px solid rgba(197,160,89,0.35)' : '1px solid rgba(255,255,255,0.1)',
      borderRadius:'var(--r-lg)', padding:28,
      transition:'all 0.3s',
      transform: hovered ? 'translateY(-3px)' : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--gold400)', marginBottom:14 }}>
        <span style={{ width:16, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
        {tip.category}
        {tip.tag && <span style={{ marginRight:'auto', background:'var(--gold100)', color:'var(--gold700)', padding:'2px 8px', borderRadius:50, fontSize:10 }}>{tip.tag}</span>}
      </div>
      <div style={{ fontSize:16, fontWeight:700, color:'var(--white)', marginBottom:10, lineHeight:1.4 }}>{tip.title}</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.8, marginBottom:20 }}>{tip.excerpt}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'rgba(255,255,255,0.3)' }}>
          <Clock size={12}/> {tip.readTime}
        </span>
        <Link to={`/tips/${tip.slug}`} style={{ fontSize:13, fontWeight:600, color:'var(--gold400)', display:'flex', alignItems:'center', gap:4, transition:'color 0.2s', textDecoration:'none' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--gold300)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--gold400)'}>
          اقرأ المقال <ArrowLeft size={14}/>
        </Link>
      </div>
    </div>
  )
}

function FooterSignupForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    padding:'14px 20px', border:'1.5px solid var(--gray200)',
    borderRadius:'var(--r-md)', fontSize:15, fontFamily:'var(--font-ar)',
    color:'var(--gray800)', background:'var(--white)',
    outline:'none', textAlign:'right', direction:'rtl', width:'100%',
    marginBottom:12,
  }

  const submit = async () => {
    if (!name.trim() || !email.includes('@')) return
    setLoading(true)
    try {
      await subscribersApi.subscribe({ name, email })
      setDone(true)
    } catch (err) {
      if (err.message?.includes('unique') || err.message?.includes('already')) {
        setDone(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ background:'var(--g50)', border:'1px solid var(--g200)', borderRadius:'var(--r-md)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12, color:'var(--g700)', fontWeight:500, fontSize:14 }}>
      <CheckCircle size={20}/> تم تسجيلك بنجاح! سنتواصل معك قريباً.
    </div>
  )

  return (
    <>
      <input type="text" placeholder="اسمك" value={name} onChange={e=>setName(e.target.value)} style={inputStyle}
        onFocus={e=>{e.target.style.borderColor='var(--g600)'}} onBlur={e=>{e.target.style.borderColor='var(--gray200)'}}/>
      <input type="email" placeholder="بريدك الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        style={inputStyle}
        onFocus={e=>{e.target.style.borderColor='var(--g600)'}} onBlur={e=>{e.target.style.borderColor='var(--gray200)'}}/>
      <button onClick={submit} disabled={loading} style={{
        width:'100%', padding:14,
        background: loading ? 'var(--gold400)' : 'var(--gold500)',
        color:'var(--white)', border:'none', borderRadius:'var(--r-md)',
        fontSize:15, fontWeight:700, boxShadow:'var(--shadow-gold)', transition:'all 0.25s',
      }}
      onMouseEnter={e=>!loading&&(e.target.style.background='var(--gold600)')}
      onMouseLeave={e=>!loading&&(e.target.style.background='var(--gold500)')}>
        {loading ? '...جارٍ التسجيل' : 'احجز مكانك الآن ←'}
      </button>
      <p style={{ fontSize:12, color:'var(--gray400)', marginTop:14 }}>بياناتك آمنة ولن تُشارك مع أي طرف ثالث</p>
    </>
  )
}
