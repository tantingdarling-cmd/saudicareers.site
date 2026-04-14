import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Briefcase, Coins, ArrowRight, Clock, CheckCircle, Loader, Building2, Star, Share2 } from 'lucide-react'
import ApplyModal from '../components/ApplyModal.jsx'
import JobStructuredData from '../components/JobStructuredData.jsx'
import { jobsApi } from '../services/api'

const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

function useSEO({ title, description, url }) {
  useEffect(() => {
    if (!title) return
    document.title = title

    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.querySelector(sel)
      if (!el) { el = document.createElement('meta'); prop ? el.setAttribute('property', name) : el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }

    const setCanonical = (href) => {
      let el = document.querySelector('link[rel="canonical"]')
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el) }
      el.setAttribute('href', href)
      return () => el.setAttribute('href', 'https://saudicareers.site')
    }

    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', url, true)
    setMeta('og:type', 'article', true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    const cleanCanonical = setCanonical(url)

    return () => {
      document.title = 'Saudi Careers | وظائف السعودية — فرص أرامكو ونيوم وPIF'
      setMeta('og:type', 'website', true)
      cleanCanonical()
    }
  }, [title, description, url])
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    jobsApi.getById(id)
      .then(data => setJob(data.data || data))
      .catch(() => setError('تعذّر تحميل الوظيفة'))
      .finally(() => setLoading(false))
  }, [id])

  useSEO({
    title: job ? `${job.title} — ${job.company} | Saudi Careers` : 'Saudi Careers',
    description: job ? `${job.title} في ${job.company}، ${job.location}. ${job.description?.slice(0, 120) || ''}` : '',
    url: `https://saudicareers.site/jobs/${id}`,
  })

  const share = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

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

  const icon = CATEGORY_ICONS[job.category] || '💼'
  const requirements = job.requirements ? job.requirements.split('\n').filter(Boolean) : []
  const description = job.description ? job.description.split('\n').filter(Boolean) : []

  return (
    <>
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
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,36px)', marginBottom:24, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:24, flexWrap:'wrap' }}>
                <div style={{ width:64, height:64, borderRadius:'var(--r-md)', background:'var(--g50)', border:'1.5px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0 }}>
                  {icon}
                </div>
                <div style={{ flex:1 }}>
                  <h1 style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:800, color:'var(--g950)', marginBottom:6, lineHeight:1.3 }}>{job.title}</h1>
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:15, color:'var(--g700)', fontWeight:600 }}>
                    <Building2 size={15} />
                    {job.company}
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
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,32px)', boxShadow:'var(--shadow-sm)' }}>
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
          </div>

          {/* ── Sidebar ── */}
          <div style={{ width:280, flexShrink:0 }} className="job-sidebar">
            <div style={{ position:'sticky', top:88, display:'flex', flexDirection:'column', gap:16 }}>
              {/* Apply Card */}
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:24, boxShadow:'var(--shadow-sm)' }}>
                <button
                  onClick={() => setShowApply(true)}
                  style={{ width:'100%', padding:'14px 0', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:700, marginBottom:12, transition:'background 0.2s' }}
                  onMouseEnter={e => e.target.style.background='var(--g700)'}
                  onMouseLeave={e => e.target.style.background='var(--g900)'}>
                  التقديم على الوظيفة ←
                </button>
                {job.apply_url && (
                  <a href={job.apply_url} target="_blank" rel="noopener noreferrer" style={{ display:'block', width:'100%', padding:'12px 0', background:'var(--g50)', color:'var(--g800)', border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, textAlign:'center', textDecoration:'none', marginBottom:12, transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--g100)'}
                    onMouseLeave={e => e.currentTarget.style.background='var(--g50)'}>
                    تقديم مباشر عبر الشركة ↗
                  </a>
                )}
                <button onClick={share} style={{ width:'100%', padding:'10px 0', background:'transparent', color:'var(--gray500)', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {copied ? <><CheckCircle size={14} color="var(--g500)" /> تم النسخ</> : <><Share2 size={14} /> مشاركة الوظيفة</>}
                </button>
              </div>

              {/* Back */}
              <button onClick={() => navigate(-1)} style={{ width:'100%', padding:'11px 0', background:'transparent', color:'var(--gray500)', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <ArrowRight size={14} /> العودة للوظائف
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} />}

      <JobStructuredData jobs={[job]} />

      <style>{`
        @media (max-width: 700px) {
          .job-detail-grid { grid-template-columns: 1fr !important; }
          .job-sidebar { width: 100% !important; position: static !important; }
        }
      `}</style>
    </>
  )
}
