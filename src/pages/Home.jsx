import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, FileText, Briefcase, Lightbulb, ArrowLeft, Clock } from 'lucide-react'
import JobCard from '../components/JobCard.jsx'
import JobSkeleton from '../components/JobSkeleton.jsx'
import ApplyModal from '../components/ApplyModal.jsx'
import JobStructuredData from '../components/JobStructuredData.jsx'
import { JOBS as FALLBACK_JOBS, TIPS as FALLBACK_TIPS, CATEGORIES } from '../data'
import { jobsApi, tipsApi, subscribersApi } from '../services/api'
import { normalizeJob } from '../utils/normalizeJob.js'
import { useFadeIn } from '../hooks/useFadeIn'
import AnimatedNumber from '../components/AnimatedNumber.jsx'


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
  if (!visible) return null
  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
      background:'#003D2B', color:'#fff',
      padding:'12px 20px', fontSize:14, textAlign:'center',
    }}>
      نستخدم ملفات تعريف الارتباط لتحسين تجربتك.
      <button onClick={() => {
        localStorage.setItem('consent_analytics', 'true')
        document.dispatchEvent(new Event('consent:granted'))
        setVisible(false)
      }} style={{
        background:'#fff', color:'#003D2B', border:'none',
        padding:'6px 16px', borderRadius:20, margin:'0 8px',
        fontWeight:600, cursor:'pointer',
      }}>موافق</button>
    </div>
  )
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [bottomSheetJob, setBottomSheetJob] = useState(null)
  const [jobs, setJobs] = useState(FALLBACK_JOBS)
  const [tips, setTips] = useState(FALLBACK_TIPS)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const location = useLocation()

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

  useEffect(() => {
    jobsApi.getAll({ per_page: 50, active: 1 })
      .then(res => {
        const apiJobs = res?.data
        if (Array.isArray(apiJobs) && apiJobs.length > 0) {
          setJobs(apiJobs.map(normalizeJob))
        }
      })
      .catch(() => {/* keep fallback */})
      .finally(() => setLoadingJobs(false))

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

  const filteredJobs = activeCategory === 'all'
    ? jobs
    : jobs.filter(j => j.category === activeCategory)

  const sectionTitle = { fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:700, color:'var(--g950)', lineHeight:1.25, marginBottom:14 }
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
        background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(0,61,43,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 5% 60%, rgba(197,160,89,0.05) 0%, transparent 55%), #F5F5F7',
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
              border:'1px solid var(--gray200)',
              padding:'5px 16px 5px 12px', borderRadius:50,
              fontSize:13, fontWeight:500, marginBottom:28,
              boxShadow:'0 1px 4px rgba(0,61,43,0.06)',
            }}>
              <span style={{ width:7, height:7, background:'var(--g600)', borderRadius:'50%', animation:'pulse 2s infinite', display:'block' }} />
              وصول مبكر مجاني — سجّل الآن
            </div>

            {/* Heading */}
            <h1 ref={heroHeadingRef} className="fade-in-section" style={{
              fontSize:'clamp(2rem,4.8vw,3.4rem)', fontWeight:700, lineHeight:1.2,
              color:'var(--g950)', marginBottom:20, letterSpacing:'-0.5px',
              fontFamily:'var(--font-ar)',
            }}>
              ارفع مستواك في سوق العمل
            </h1>

            {/* Description */}
            <p ref={heroDescRef} className="fade-in-section delay-1" style={{
              fontSize:'clamp(1rem,1.6vw,1.1rem)', color:'var(--gray600)',
              maxWidth:480, marginBottom:36, lineHeight:1.9, fontWeight:500,
            }}>
              حلّل سيرتك الذاتية، اكتشف نقاط التحسين، وتنافس على أفضل الفرص في السوق السعودي.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:32 }}>
              <Link to="/resume-analyzer" data-track="hero_cta" style={{
                background:'linear-gradient(135deg,var(--g900) 0%,var(--g950) 100%)', color:'var(--white)',
                padding:'13px 28px', borderRadius:'var(--r-md)',
                fontSize:15, fontWeight:700, textDecoration:'none',
                transition:'background 0.2s', boxShadow:'var(--shadow-md)',
              }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--g700)'}
              onMouseLeave={e=>e.currentTarget.style.background='linear-gradient(135deg,var(--g900) 0%,var(--g950) 100%)'}>
                افحص سيرتك مجاناً ✦
              </Link>
              <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior:'smooth' })} style={{
                background:'var(--white)', color:'var(--g900)',
                padding:'13px 28px', borderRadius:'var(--r-md)',
                fontSize:15, fontWeight:600, border:'1.5px solid var(--gray200)',
                cursor:'pointer', transition:'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g400)';e.currentTarget.style.boxShadow='var(--shadow-sm)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray200)';e.currentTarget.style.boxShadow='none'}}>
                تصفّح الوظائف
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
              <span>انضم أكثر من <strong style={{ color:'var(--g800)' }}>120+</strong> محترف</span>
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
      <div style={{ background:'var(--g900)', padding:'clamp(40px,6vw,64px) clamp(1rem,4vw,3rem)' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:32, textAlign:'center' }}>
          {[
            { val:75, prefix:'', accent:'٪', label:'من السير الذاتية تُرفض آلياً قبل مراجعتها' },
            { val:2,  prefix:'+', accent:'م', label:'باحث عن عمل في السعودية' },
            { val:70, prefix:'', accent:'٪', label:'نسبة التوطين المستهدفة برؤية 2030' },
            { val:48, prefix:'', accent:'س', label:'لتحسين سيرتك الذاتية عند التسجيل' },
          ].map(({ val, prefix, accent, label }) => (
            <StatItem key={label} val={val} prefix={prefix} accent={accent} label={label} />
          ))}
        </div>
      </div>

      {/* ── JOBS ── */}
      <section style={{ padding:'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background:'var(--gray50)' }} id="jobs">
        <div style={{ maxWidth:1160, margin:'0 auto' }}>
          <Reveal>
            <div style={eyebrow}><span style={{ width:28, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/> فرص موثوقة</div>
            <h2 style={sectionTitle}>أحدث الوظائف في السوق السعودي</h2>
            <p style={sectionSub}>نجمع الفرص الوظيفية من مصادرها الرسمية ونتحقق من صحتها قبل نشرها</p>
          </Reveal>

          {/* Filter */}
          <Reveal delay={100}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:36 }}>
              {CATEGORIES.map(({ key, label }) => (
                <button key={key} onClick={() => setActiveCategory(key)} style={{
                  padding:'8px 20px', borderRadius:50,
                  border: activeCategory===key ? '1.5px solid var(--g900)' : '1.5px solid var(--gray200)',
                  fontSize:13, fontWeight:500,
                  color: activeCategory===key ? 'var(--white)' : 'var(--gray600)',
                  background: activeCategory===key ? 'var(--g900)' : 'var(--white)',
                  cursor:'pointer', transition:'all 0.2s',
                }}>{label}</button>
              ))}
            </div>
          </Reveal>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap:20 }}>
            {/* §6 / §7: Show JobSkeleton while API call is in-flight.
                Fallback static data renders immediately → no blank state.
                Skeletons show ONLY during the first load (loadingJobs=true). */}
            {loadingJobs
              ? Array.from({ length: 6 }).map((_, i) => <JobSkeleton key={i} />)
              : filteredJobs.map((job, i) => (
                  <Reveal key={job.id} delay={i * 60}>
                    <JobCard
                      job={job}
                      onApply={setSelectedJob}
                      onDetails={setBottomSheetJob}
                      onTagClick={tag => {
                        const cat = CATEGORIES.find(c => c.label === tag)
                        if (cat) {
                          setActiveCategory(cat.key)
                          document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })
                        }
                      }}
                    />
                  </Reveal>
                ))
            }
          </div>
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
              { emoji:'📄', title:'تحسين السيرة الذاتية', desc:'مراجعة احترافية تضمن أن سيرتك تتجاوز أنظمة الفحص الآلي وتصل للمسؤولين الفعليين — مجاناً.', features:['توافق مع معايير ATS','صياغة بالعربية والإنجليزية','مراجعة خلال 48 ساعة'], tag:'مجاني عند التسجيل', tagGold:false, accent:'var(--gold400)', featured:true, delay:0, ctaLink:'/resume-analyzer', ctaText:'افحص سيرتك الآن ✦' },
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
              <h2 style={{ ...sectionTitle, marginBottom:0 }}>أربع خطوات للوظيفة المناسبة</h2>
            </div>
          </Reveal>
          <div style={{ position:'relative' }}>
            {/* Connecting line — desktop only, hidden on mobile via opacity trick */}
            <div aria-hidden="true" style={{
              position:'absolute', top:30, right:'12.5%', left:'12.5%', height:2,
              background:'linear-gradient(to left, var(--g900) 0%, var(--gold400) 50%, var(--g200) 100%)',
              borderRadius:2, zIndex:0,
              display:'block',
            }} className="steps-connector" />

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:24, position:'relative', zIndex:1 }}>
              {[
                { n:'1', title:'سجّل مجاناً', desc:'أنشئ حسابك وأخبرنا عن تخصصك وأهدافك المهنية', numBg:'var(--g50)', numColor:'var(--g800)', numBorder:'var(--g200)' },
                { n:'2', title:'حسّن سيرتك', desc:'ارفع سيرتك الذاتية واحصل على مراجعة احترافية خلال 48 ساعة', numBg:'var(--gold100)', numColor:'var(--gold700)', numBorder:'var(--gold300)' },
                { n:'3', title:'اكتشف الفرص', desc:'تصفّح الوظائف والدورات الموثّقة المناسبة لمجالك وخبرتك', numBg:'var(--g50)', numColor:'var(--g800)', numBorder:'var(--g200)' },
                { n:'4', title:'احصل على وظيفتك', desc:'قدّم بثقة مع الإرشادات التي تدعمك في كل خطوة حتى التعيين', numBg:'var(--g900)', numColor:'var(--white)', numBorder:'var(--g700)' },
              ].map(({ n, title, desc, numBg, numColor, numBorder }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <StepCard n={n} title={title} desc={desc} numBg={numBg} numColor={numColor} numBorder={numBorder} />
                </Reveal>
              ))}
            </div>
          </div>
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
