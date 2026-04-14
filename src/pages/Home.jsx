import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, FileText, Briefcase, Lightbulb, ArrowLeft, Clock } from 'lucide-react'
import JobCard from '../components/JobCard.jsx'
import JobSkeleton from '../components/JobSkeleton.jsx'
import ApplyModal from '../components/ApplyModal.jsx'
import JobStructuredData from '../components/JobStructuredData.jsx'
import { JOBS as FALLBACK_JOBS, TIPS as FALLBACK_TIPS, CATEGORIES } from '../data'
import { jobsApi, tipsApi, subscribersApi } from '../services/api'

const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

const EXP_LABELS = {
  entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير', lead: 'قائد', executive: 'تنفيذي',
}

function normalizeJob(job) {
  const tags = [job.category_label, EXP_LABELS[job.experience_level], job.job_type_label]
    .filter(Boolean).slice(0, 3)
  return {
    id: job.id,
    company: job.company,
    icon: CATEGORY_ICONS[job.category] || '💼',
    title: job.title,
    location: job.location,
    type: job.job_type_label || job.job_type,
    salary: job.salary || 'يُحدد عند التواصل',
    tags,
    badge: job.is_featured ? 'featured' : '',
    badgeText: job.is_featured ? 'حصرية' : '',
    posted: job.posted_at || 'حديثاً',
    category: job.category,
    description: job.description,
  }
}

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

/* ── CountUp hook ────────────────────────── */
function useCountUp(target, visible, duration = 1600) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible || !target) return
    let startTime = null
    const animate = ts => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visible, target, duration])
  return count
}

const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])

function StatItem({ val, prefix = '', accent, label }) {
  const [ref, vis] = useReveal()
  const count = useCountUp(val, vis)
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.65s ease, transform 0.65s ease',
    }}>
      <div style={{ fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:800, color:'var(--white)', lineHeight:1, marginBottom:6, fontFamily:'var(--font-en)' }}>
        {prefix}{toAr(count)}<span style={{ color:'var(--gold400)' }}>{accent}</span>
      </div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{label}</div>
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
              fontSize:15, fontWeight:600, transition:'all 0.2s', cursor:'pointer',
            }}
            onMouseEnter={e=>!loading&&(e.currentTarget.style.background='var(--g700)')}
            onMouseLeave={e=>!loading&&(e.currentTarget.style.background='var(--g900)')}>
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
export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
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

  const filteredJobs = activeCategory === 'all'
    ? jobs
    : jobs.filter(j => j.category === activeCategory)

  const sectionTitle = { fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:700, color:'var(--g950)', lineHeight:1.25, marginBottom:14 }
  const sectionSub = { fontSize:'1rem', color:'var(--gray600)', maxWidth:540, lineHeight:1.85, marginBottom:48 }
  const eyebrow = { display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--gold600)', marginBottom:14 }

  return (
    <>
      {/* ── HERO (Minimalist) ── */}
      <section style={{
        minHeight: '100vh',
        padding: '120px clamp(1rem,4vw,3rem) 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        background: '#FAFAF9',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* خط عرضي خفيف في الأعلى */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, transparent, var(--g700) 40%, var(--gold500) 70%, transparent)' }}/>

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', maxWidth:680 }}>

          {/* badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--white)', color:'var(--g800)',
            border:'1px solid var(--gray200)',
            padding:'5px 16px 5px 12px', borderRadius:50,
            fontSize:13, fontWeight:500, marginBottom:32,
            boxShadow:'0 1px 4px rgba(0,61,43,0.06)',
          }}>
            <span style={{ width:7, height:7, background:'var(--g600)', borderRadius:'50%', animation:'pulse 2s infinite', display:'block' }}/>
            وصول مبكر مجاني — سجّل الآن
          </div>

          {/* heading */}
          <h1 style={{
            fontSize: 'clamp(2.2rem,5.5vw,3.8rem)',
            fontWeight: 700,
            lineHeight: 1.2,
            color: 'var(--g950)',
            maxWidth: 640,
            marginBottom: 20,
            letterSpacing: '-0.5px',
            fontFamily: 'var(--font-ar)',
          }}>
            طريقك للفرصة
            <span style={{ display:'block', color:'var(--g600)', fontWeight:600 }}>في سوق العمل السعودي</span>
          </h1>

          {/* sub */}
          <p style={{
            fontSize: 'clamp(1rem,2vw,1.1rem)',
            color: 'var(--gray600)',
            maxWidth: 520,
            marginBottom: 44,
            lineHeight: 1.9,
            fontFamily: 'var(--font-ar)',
          }}>
            افحص سيرتك الذاتية مجاناً، اكتشف أفضل الوظائف، واحصل على نصائح موثوقة من خبراء الموارد البشرية.
          </p>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:48 }}>
            <Link to="/resume-analyzer" style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--g900)', color:'var(--white)',
              padding:'13px 28px', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:600, textDecoration:'none',
              transition:'background 0.2s',
            }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--g700)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--g900)'}
            >
              افحص سيرتك مجاناً ✦
            </Link>
            <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior:'smooth' })} style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--white)', color:'var(--g900)',
              padding:'13px 28px', borderRadius:'var(--r-md)',
              fontSize:15, fontWeight:600, border:'1.5px solid var(--gray200)',
              cursor:'pointer', transition:'border-color 0.2s',
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--g600)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--gray200)'}
            >
              تصفّح الوظائف
            </button>
          </div>

          {/* social proof */}
          <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:'var(--gray400)' }}>
            <div style={{ display:'flex', direction:'ltr' }}>
              {['أح','سم','عب','+'].map((t,i) => (
                <div key={i} style={{
                  width:28, height:28, borderRadius:'50%', border:'2px solid #FAFAF9',
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
                    <JobCard job={job} onApply={setSelectedJob} />
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:32, position:'relative' }}>
            {[
              { n:'١', title:'سجّل مجاناً', desc:'أنشئ حسابك وأخبرنا عن تخصصك وأهدافك المهنية', numBg:'var(--g50)', numColor:'var(--g800)', numBorder:'var(--g200)' },
              { n:'٢', title:'حسّن سيرتك', desc:'ارفع سيرتك الذاتية واحصل على مراجعة احترافية خلال 48 ساعة', numBg:'var(--gold100)', numColor:'var(--gold700)', numBorder:'var(--gold300)' },
              { n:'٣', title:'اكتشف الفرص', desc:'تصفّح الوظائف والدورات الموثّقة المناسبة لمجالك وخبرتك', numBg:'var(--g50)', numColor:'var(--g800)', numBorder:'var(--g200)' },
              { n:'٤', title:'احصل على وظيفتك', desc:'قدّم بثقة مع الإرشادات التي تدعمك في كل خطوة حتى التعيين', numBg:'var(--g900)', numColor:'var(--white)', numBorder:'var(--g700)' },
            ].map(({ n, title, desc, numBg, numColor, numBorder }, i) => (
              <Reveal key={title} delay={i*80} style={{ textAlign:'center', padding:'0 12px' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:numBg, border:`2px solid ${numBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:numColor, margin:'0 auto 20px', position:'relative', zIndex:1 }}>{n}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:8 }}>{title}</div>
                <div style={{ fontSize:13, color:'var(--gray600)', lineHeight:1.75 }}>{desc}</div>
              </Reveal>
            ))}
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
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      `}</style>
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
      boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
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
