import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Briefcase, Coins, ArrowRight, Clock, CheckCircle, Loader, Building2, Star, Share2, Download, MessageCircle, Linkedin, X, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import ApplyModal from '../components/ApplyModal.jsx'
import NativeApplyModal from '../components/NativeApplyModal.jsx'
import { jobsApi } from '../services/api'

// §5: Maps DB job_type enum → Schema.org employmentType
const EMPLOYMENT_TYPE_MAP = {
  full_time:  'FULL_TIME',
  part_time:  'PART_TIME',
  contract:   'CONTRACTOR',
  internship: 'INTERN',
  remote:     'FULL_TIME',
}

const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

// Safe JSON for inline <script> — escapes </script> injection
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/<\/script>/gi, '<\\/script>')
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isAuth = !!localStorage.getItem('auth_token')
  const [job, setJob] = useState(null)
  const [similar, setSimilar] = useState([])   // §9: similar_jobs from API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [copied, setCopied] = useState(false)

  const [seoMeta, setSeoMeta] = useState(null)  // §4: from SeoService via API
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const jobCardRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    jobsApi.getById(id)
      .then(data => {
        // §4: show() returns { data: Job, seo: { title, description, json_ld } }
        const j = data.data || data
        setJob(j)
        jobsApi.getSimilar(id)
          .then(r => setSimilar(r?.data || []))
          .catch(() => setSimilar(data.similar_jobs?.data || data.similar_jobs || []))
        if (data.seo) setSeoMeta(data.seo)
        // fire view_job pixel event if user has consented
        if (localStorage.getItem('consent_analytics') === 'true') {
          if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', { item_ids: [String(j.id)], item_category: j.category })
          if (window.twq)   window.twq('event', 'tw-ViewContent', { value: null })
        }
      })
      .catch(() => setError('تعذّر تحميل الوظيفة'))
      .finally(() => setLoading(false))
  }, [id])

  const share = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const shareWhatsApp = () => {
    if (!job) return
    const reqs = job.requirements ? job.requirements.split('\n').filter(Boolean).slice(0, 3) : []
    const reqText = reqs.length ? '\n\nالمتطلبات الرئيسية:\n' + reqs.map(r => `• ${r}`).join('\n') : ''
    const salary  = job.salary ? `\n💰 الراتب: ${job.salary} ر.س` : ''
    const text = `وظيفة: ${job.title}\n🏢 الشركة: ${job.company}\n📍 المدينة: ${job.location}${salary}${reqText}\n\nقدّم الآن 👇\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareLinkedIn = () => {
    if (!job) return
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=500')
  }

  const downloadAsImage = async () => {
    if (!jobCardRef.current || !job) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(jobCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `وظيفة-${job.title}-${job.company}.png`.replace(/\s/g, '-')
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  // ── §4 / §5: Structured data for Google Jobs ──────────────────

  // خريطة experience_level → OccupationalExperienceRequirements (Google Jobs standard)
  const EXPERIENCE_REQUIREMENTS_MAP = {
    entry:     { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 0  },
    junior:    { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 12 },
    mid:       { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 36 },
    senior:    { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 60 },
    lead:      { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 84 },
    executive: { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: 120 },
  }

  // وصف كافٍ لـ Google Jobs (لا يقل عن 100 حرف)
  const buildDescription = (j) => {
    if (j.description && j.description.length >= 100) return j.description
    const parts = [`وظيفة ${j.title} في شركة ${j.company} بمدينة ${j.location}.`]
    if (j.job_type_label) parts.push(`نوع الدوام: ${j.job_type_label}.`)
    if (j.experience_level) parts.push(`مستوى الخبرة المطلوب: ${j.experience_level}.`)
    if (j.requirements) parts.push(`المتطلبات: ${j.requirements.slice(0, 300)}`)
    return parts.join(' ')
  }

  const jobLd = job ? safeJsonLd({
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    // §Google: معرّف فريد للوظيفة — يمنع التكرار في نتائج البحث
    identifier: {
      '@type': 'PropertyValue',
      name: 'سعودي كارييرز',
      value: String(job.id),
    },
    title: job.title,
    description: buildDescription(job),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      ...(job.company_logo && { logo: job.company_logo }),
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'SA',
      },
    },
    // §Google: OccupationalExperienceRequirements بدلاً من string عادي
    ...(job.experience_level && EXPERIENCE_REQUIREMENTS_MAP[job.experience_level] && {
      experienceRequirements: EXPERIENCE_REQUIREMENTS_MAP[job.experience_level],
    }),
    // §5: job_type enum → Schema.org employmentType
    employmentType: EMPLOYMENT_TYPE_MAP[job.job_type] || 'FULL_TIME',
    datePosted: job.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    validThrough: (() => {
      const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]
    })(),
    // directApply: true فقط عند وجود رابط خارجي — التقديم الداخلي يحتاج login
    directApply: !!job.apply_url,
    url: job.apply_url || `https://saudicareers.site/jobs/${job.slug || job.id}`,
    // §4: salary fields are nullable — only emit when present
    ...(job.salary_min && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'SAR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max || job.salary_min,
          unitText: 'MONTH',
        },
      },
    }),
    applicantLocationRequirements: { '@type': 'Country', name: 'Saudi Arabia' },
  }) : null

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:68 }}>
      <Loader size={40} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !job) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:68, gap:16 }}>
      <div style={{ fontSize:18, color:'var(--gray600)' }}>{error || 'الوظيفة غير موجودة'}</div>
      <Link to="/" style={{ color:'var(--g700)', fontWeight:600, fontSize:14 }}>← العودة للرئيسية</Link>
    </div>
  )

  const icon         = CATEGORY_ICONS[job.category] || '💼'
  const requirements = job.requirements ? job.requirements.split('\n').filter(Boolean) : []
  const description  = job.description  ? job.description.split('\n').filter(Boolean)  : []

  // §4: استخدم بيانات SeoService من الـ API إذا توفرت، وإلا ابنِها محلياً (fallback)
  const pageTitle = seoMeta?.title    || `${job.title} | ${job.company} — سعودي كارييرز`
  const pageDesc  = seoMeta?.description || `${job.title} في ${job.company}، ${job.location}. ${job.description?.slice(0, 120) || ''}`
  // canonical = slug إذا متوفر، وإلا id — يطابق sitemap تماماً
  const canonicalSlug = job.slug || id
  const pageUrl = `https://saudicareers.site/jobs/${canonicalSlug}`

  // §5: JSON-LD — يُفضَّل مصدر SeoService (يتضمن salary_currency)؛ وإلا استخدم البناء المحلي
  const resolvedJsonLd = seoMeta?.json_ld ? safeJsonLd(seoMeta.json_ld) : jobLd

  return (
    <>
      {/* ── §4: SEO meta + JSON-LD structured data via react-helmet-async ── */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description"         content={pageDesc} />
        <link rel="canonical"            href={pageUrl} />
        {/* Open Graph */}
        <meta property="og:type"         content="article" />
        <meta property="og:title"        content={pageTitle} />
        <meta property="og:description"  content={pageDesc} />
        <meta property="og:url"          content={pageUrl} />
        <meta property="og:site_name"    content="سعودي كارييرز" />
        {/* og:image — صورة عامة بانتظار dynamic OG images */}
        <meta property="og:image"        content="https://saudicareers.site/og-image.svg" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        {/* Twitter */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image"       content="https://saudicareers.site/og-image.svg" />
        {/* BreadcrumbList — يُحسّن مسار التنقل في نتائج Google */}
        <script type="application/ld+json">{safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://saudicareers.site' },
            { '@type': 'ListItem', position: 2, name: 'الوظائف',  item: 'https://saudicareers.site/#jobs' },
            { '@type': 'ListItem', position: 3, name: job.title,  item: pageUrl },
          ],
        })}</script>
        {/* §5: JobPosting structured data — SeoService أو fallback محلي */}
        <script type="application/ld+json">{resolvedJsonLd}</script>
      </Helmet>

      {/* ── Breadcrumb ── */}
      <div style={{ paddingTop:88, background:'var(--gray50)', borderBottom:'1px solid var(--gray200)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'16px clamp(1rem,4vw,2rem)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--gray400)' }}>
            <Link to="/" style={{ color:'var(--g600)', fontWeight:500 }}>الرئيسية</Link>
            <span>/</span>
            <span style={{ color:'var(--gray600)' }}>الوظائف</span>
            <span>/</span>
            <span style={{ color:'var(--gray800)', fontWeight:600 }}>{job.title}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem) 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'clamp(1.5rem,3vw,2.5rem)', alignItems:'start' }} className="job-detail-grid">

          {/* ── Main Content ── */}
          <div>
            {/* Header Card */}
            <div ref={jobCardRef} style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,36px)', marginBottom:24, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:24, flexWrap:'wrap' }}>
                <div style={{ width:64, height:64, borderRadius:'var(--r-md)', background:'var(--g50)', border:'1.5px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0 }}>
                  {icon}
                </div>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:800, color:'var(--g950)', marginBottom:6, lineHeight:1.3 }}>{job.title}</h1>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:15, color:'var(--g700)', fontWeight:600 }}>
                    <Building2 size={15} />
                    {job.company_slug ? (
                      <Link to={`/company/${job.company_slug}`} style={{ color:'var(--g700)', textDecoration:'none' }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--g500)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--g700)'}>{job.company}</Link>
                    ) : job.company}
                  </div>
                </div>
                {job.is_featured && (
                  <span style={{ display:'flex', alignItems:'center', gap:4, background:'var(--g50)', color:'var(--g700)', border:'1px solid var(--g200)', padding:'6px 14px', borderRadius:50, fontSize:12, fontWeight:700, flexShrink:0 }}>
                    <Star size={12} fill="var(--g500)" /> حصرية
                  </span>
                )}
              </div>

              {/* Meta pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:24 }}>
                {[
                  { icon: <MapPin size={14} />, text: job.location },
                  { icon: <Briefcase size={14} />, text: job.job_type_label || job.job_type },
                  { icon: <Clock size={14} />, text: job.posted_at || 'حديثاً' },
                ].map(({ icon: ic, text }) => (
                  <span key={text} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--gray600)', background:'var(--gray50)', border:'1px solid var(--gray200)', padding:'7px 14px', borderRadius:50 }}>
                    {ic} {text}
                  </span>
                ))}
                {job.category_label && (
                  <span style={{ fontSize:13, color:'var(--g700)', background:'var(--g50)', border:'1px solid var(--g100)', padding:'7px 14px', borderRadius:50, fontWeight:600 }}>
                    {job.category_label}
                  </span>
                )}
              </div>

              {/* Salary */}
              {job.salary && (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 18px', background:'var(--g50)', border:'1.5px solid var(--g100)', borderRadius:'var(--r-md)', marginBottom:8 }}>
                  <Coins size={18} color="var(--gold500)" />
                  <span style={{ fontSize:17, fontWeight:800, color:'var(--g800)' }}>{job.salary}</span>
                  <span style={{ fontSize:13, color:'var(--gray400)' }}>شهرياً</span>
                </div>
              )}

              {/* Watermark for image download */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', marginTop:8, gap:4, opacity:0.4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--g700)', letterSpacing:0.5 }}>saudicareers.site</span>
              </div>
            </div>

            {/* Description */}
            {description.length > 0 && (
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,32px)', marginBottom:24, boxShadow:'var(--shadow-sm)' }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:'var(--g950)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:4, height:20, background:'var(--g500)', borderRadius:2, display:'block' }}/>
                  عن الوظيفة
                </h2>
                <div style={{ lineHeight:2, color:'var(--gray600)', fontSize:14.5 }}>
                  {description.map((line, i) => <p key={i} style={{ marginBottom: i < description.length-1 ? 10 : 0 }}>{line}</p>)}
                </div>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,32px)', marginBottom:24, boxShadow:'var(--shadow-sm)' }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:'var(--g950)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:4, height:20, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
                  المتطلبات
                </h2>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
                  {requirements.map((req, i) => (
                    <li key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:14.5, color:'var(--gray600)', lineHeight:1.7 }}>
                      <CheckCircle size={16} color="var(--g500)" style={{ flexShrink:0, marginTop:3 }} />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── §9: وظائف مشابهة ────────────────────────────── */}
            {similar.length > 0 && (
              <div style={{ marginTop:8 }}>
                <h2 style={{ fontSize:17, fontWeight:700, color:'var(--g950)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:4, height:20, background:'var(--g500)', borderRadius:2, display:'block' }}/>
                  قد تعجبك أيضًا
                </h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap:14 }}>
                  {similar.map(s => (
                    <Link
                      key={s.id}
                      to={`/jobs/${s.id}`}
                      style={{ textDecoration:'none', display:'block', background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'18px 20px', transition:'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--g400)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray200)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
                    >
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:'var(--g600)', marginBottom:6, textTransform:'uppercase' }}>
                        {s.category_label || s.category}
                      </div>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--g950)', lineHeight:1.4, marginBottom:6 }}>{s.title}</div>
                      <div style={{ fontSize:12, color:'var(--gray500)' }}>{s.company} · {s.location}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ width:280, flexShrink:0 }} className="job-sidebar">
            <div style={{ position:'sticky', top:88, display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:24, boxShadow:'var(--shadow-sm)' }}>
                <button
                  onClick={() => {
                    if (!isAuth) { navigate(`/login?next=/jobs/${id}`); return }
                    setShowApply(true)
                  }}
                  style={{ width:'100%', padding:'14px 0', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:700, marginBottom:12, transition:'background 0.2s', cursor:'pointer', fontFamily:'var(--font-ar)' }}
                  onMouseEnter={e => e.target.style.background='var(--g700)'}
                  onMouseLeave={e => e.target.style.background='var(--g900)'}>
                  {isAuth ? 'التقديم على الوظيفة ←' : 'سجّل دخولك للتقديم ←'}
                </button>
                {job.apply_url && (
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                    style={{ display:'block', width:'100%', padding:'12px 0', background:'var(--g50)', color:'var(--g800)', border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, textAlign:'center', textDecoration:'none', marginBottom:12, transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--g100)'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--g50)'}>
                    تقديم مباشر عبر الشركة ↗
                  </a>
                )}
                {/* Share button — opens panel */}
                <button onClick={() => setShowSharePanel(v => !v)}
                  style={{ width:'100%', padding:'10px 0', background: showSharePanel ? 'var(--g50)' : 'transparent', color:'var(--gray500)', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
                  onMouseLeave={e => e.currentTarget.style.background= showSharePanel ? 'var(--g50)' : 'transparent'}>
                  <Share2 size={14} /> مشاركة الوظيفة
                </button>

                {/* ── Share Panel ── */}
                {showSharePanel && (
                  <div style={{ marginTop:12, padding:'16px', background:'var(--gray50)', borderRadius:'var(--r-md)', border:'1px solid var(--gray200)', display:'flex', flexDirection:'column', gap:10 }}>

                    {/* WhatsApp */}
                    <button onClick={shareWhatsApp}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', background:'#25D366', color:'#fff', border:'none', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      <MessageCircle size={15} fill="#fff" /> مشاركة عبر واتساب
                    </button>

                    {/* LinkedIn */}
                    <button onClick={shareLinkedIn}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', background:'#0A66C2', color:'#fff', border:'none', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor:'pointer', transition:'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      <Linkedin size={15} fill="#fff" /> مشاركة في لينكد إن
                    </button>

                    {/* Copy link */}
                    <button onClick={share}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', background:'var(--white)', color:'var(--gray600)', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--gray100)'}
                      onMouseLeave={e => e.currentTarget.style.background='var(--white)'}>
                      {copied ? <><CheckCircle size={14} color="var(--g500)" /> تم نسخ الرابط</> : <><Share2 size={14} /> نسخ الرابط</>}
                    </button>

                    {/* Download as image */}
                    <button onClick={downloadAsImage} disabled={downloading}
                      style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor: downloading ? 'wait' : 'pointer', opacity: downloading ? 0.7 : 1, transition:'all 0.2s' }}
                      onMouseEnter={e => { if (!downloading) e.currentTarget.style.background='var(--g700)' }}
                      onMouseLeave={e => e.currentTarget.style.background='var(--g900)'}>
                      <Download size={14} /> {downloading ? 'جاري التحميل...' : 'تحميل كصورة'}
                    </button>

                    {/* QR Code */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'14px', background:'var(--white)', borderRadius:'var(--r-md)', border:'1px solid var(--gray200)', gap:8 }}>
                      <QRCodeSVG value={window.location.href} size={110} fgColor="var(--g950)" bgColor="#ffffff" level="M" />
                      <span style={{ fontSize:11, color:'var(--gray400)', textAlign:'center' }}>امسح الكود للدخول للوظيفة</span>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => navigate(-1)}
                style={{ width:'100%', padding:'11px 0', background:'transparent', color:'var(--gray500)', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <ArrowRight size={14} /> العودة للوظائف
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApply && (
        isAuth
          ? <NativeApplyModal job={job} onClose={() => setShowApply(false)} />
          : <ApplyModal job={job} onClose={() => setShowApply(false)} />
      )}

      <style>{`
        @media (max-width: 700px) {
          .job-detail-grid { grid-template-columns: 1fr !important; }
          .job-sidebar { width: 100% !important; position: static !important; }
        }
      `}</style>
    </>
  )
}
