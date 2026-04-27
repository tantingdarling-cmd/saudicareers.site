import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Clock, ArrowRight, CheckCircle, Share2, Loader, ArrowLeft, BookOpen } from 'lucide-react'
import { tipsApi } from '../services/api'

/* ── SEO ─────────────────────────────────── */
function useSEO({ title, description, url, image }) {
  useEffect(() => {
    if (!title) return

    const prev = {
      title: document.title,
    }

    document.title = title

    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let el = document.querySelector(sel)
      if (!el) {
        el = document.createElement('meta')
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name)
        document.head.appendChild(el)
      }
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
    if (image) setMeta('og:image', image, true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    const cleanCanonical = setCanonical(url)

    return () => {
      document.title = prev.title
      setMeta('og:type', 'website', true)
      cleanCanonical()
    }
  }, [title, description, url, image])
}

/* ── JSON-LD Article ─────────────────────── */
function ArticleStructuredData({ tip, url }) {
  useEffect(() => {
    if (!tip) return

    const existing = document.getElementById('article-structured-data')
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.id = 'article-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: tip.title,
      description: tip.excerpt || tip.title,
      url,
      datePublished: tip.created_at || new Date().toISOString(),
      dateModified: tip.updated_at || tip.created_at || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Saudi Careers',
        url: 'https://saudicareers.site',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Saudi Careers',
        logo: {
          '@type': 'ImageObject',
          url: 'https://saudicareers.site/saudi.png',
        },
      },
      inLanguage: 'ar',
      about: {
        '@type': 'Thing',
        name: 'سوق العمل السعودي',
      },
    })
    document.head.appendChild(script)

    return () => {
      const el = document.getElementById('article-structured-data')
      if (el) el.remove()
    }
  }, [tip, url])

  return null
}

/* ── FAQ Schema for TipDetail ─────────────── */
function TipFAQSchema({ tip }) {
  useEffect(() => {
    if (!tip) return
    const existing = document.getElementById('faq-structured-data')
    if (existing) existing.remove()
    const script = document.createElement('script')
    script.id = 'faq-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: `ما هي أهم نقاط "${tip.title}"؟`, acceptedAnswer: { '@type': 'Answer', text: tip.excerpt || tip.title } },
        { '@type': 'Question', name: 'كيف أطبّق هذه النصيحة في سوق العمل السعودي؟', acceptedAnswer: { '@type': 'Answer', text: 'اقرأ المقال كاملاً وطبّق الخطوات على سيرتك الذاتية، ثم استخدم أداة تحسين السيرة للتحقق من مدى التوافق مع الوظيفة.' } },
      ],
    })
    document.head.appendChild(script)
    return () => { const el = document.getElementById('faq-structured-data'); if (el) el.remove() }
  }, [tip])
  return null
}

/* ── Content renderer ─────────────────────── */
function renderContent(content) {
  if (!content) return null
  return content.split('\n').filter(Boolean).map((line, i) => {
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} style={{ fontSize:20, fontWeight:700, color:'var(--g950)', margin:'32px 0 14px', lineHeight:1.35, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:4, height:22, background:'var(--gold500)', borderRadius:2, flexShrink:0, display:'block' }}/>
          {line.replace('## ', '')}
        </h2>
      )
    }
    if (line.startsWith('# ')) {
      return <h1 key={i} style={{ fontSize:24, fontWeight:800, color:'var(--g950)', margin:'36px 0 16px', lineHeight:1.3 }}>{line.replace('# ', '')}</h1>
    }
    if (line.startsWith('- ')) {
      return (
        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
          <CheckCircle size={15} color="var(--g500)" style={{ flexShrink:0, marginTop:3 }} />
          <span style={{ fontSize:15, color:'var(--gray700)', lineHeight:1.8 }}>{line.replace('- ', '')}</span>
        </div>
      )
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} style={{ fontSize:15, fontWeight:700, color:'var(--g800)', marginBottom:10, lineHeight:1.8 }}>{line.replace(/\*\*/g, '')}</p>
    }
    return <p key={i} style={{ fontSize:15, color:'var(--gray600)', lineHeight:2, marginBottom:14 }}>{line}</p>
  })
}

/* ── Main Page ─────────────────────────────── */
export default function TipDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [tip, setTip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [relatedTips, setRelatedTips] = useState([])

  const url = `https://saudicareers.site/tips/${slug}`

  useEffect(() => {
    tipsApi.getBySlug(slug)
      .then(data => setTip(data.data || data))
      .catch(() => setError('تعذّر تحميل المقال'))
      .finally(() => setLoading(false))

    // Fetch related tips
    tipsApi.getAll({ per_page: 4 })
      .then(res => {
        const all = res?.data || []
        setRelatedTips(all.filter(t => t.slug !== slug).slice(0, 3))
      })
      .catch(() => {})
  }, [slug])

  useSEO({
    title: tip ? `${tip.title} | Saudi Careers` : 'Saudi Careers — نصائح مهنية',
    description: tip?.excerpt || 'نصائح مهنية متخصصة لسوق العمل السعودي من Saudi Careers',
    url,
    image: 'https://saudicareers.site/saudi.png',
  })

  const share = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:68 }}>
      <Loader size={40} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !tip) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:68, gap:16 }}>
      <div style={{ fontSize:18, color:'var(--gray600)' }}>{error || 'المقال غير موجود'}</div>
      <Link to="/#tips" style={{ color:'var(--g700)', fontWeight:600, fontSize:14 }}>← العودة للنصائح</Link>
    </div>
  )

  const readTime = tip.read_time || tip.readTime || '٥ دقائق'

  return (
    <>
      <ArticleStructuredData tip={tip} url={url} />
      <TipFAQSchema tip={tip} />

      {/* ── Breadcrumb ── */}
      <div style={{ paddingTop:88, background:'var(--gray50)', borderBottom:'1px solid var(--gray200)' }}>
        <div style={{ maxWidth:820, margin:'0 auto', padding:'16px clamp(1rem,4vw,2rem)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--gray400)' }}>
            <Link to="/" style={{ color:'var(--g600)', fontWeight:500 }}>الرئيسية</Link>
            <span>/</span>
            <Link to="/#tips" style={{ color:'var(--g600)', fontWeight:500 }}>النصائح</Link>
            <span>/</span>
            <span style={{ color:'var(--gray800)', fontWeight:600 }}>{tip.title}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:'0 auto', padding:'clamp(2rem,5vw,3.5rem) clamp(1rem,4vw,2rem) 80px' }}>

        {/* ── Article Header ── */}
        <div style={{ marginBottom:40 }}>
          {tip.category_label || tip.category ? (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--gold600)', marginBottom:18 }}>
              <span style={{ width:20, height:2, background:'var(--gold500)', borderRadius:2, display:'block' }}/>
              {tip.category_label || tip.category}
            </div>
          ) : null}

          <h1 style={{ fontSize:'clamp(22px,4vw,32px)', fontWeight:800, color:'var(--g950)', lineHeight:1.3, marginBottom:20 }}>
            {tip.title}
          </h1>

          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:16 }}>
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--gray400)' }}>
              <Clock size={14} /> وقت القراءة: {readTime}
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--gray400)' }}>
              <BookOpen size={14} /> نصيحة مهنية
            </span>
            <button
              onClick={share}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color: copied ? 'var(--g600)' : 'var(--gray400)', background:'transparent', border:'1px solid var(--gray200)', padding:'6px 14px', borderRadius:50, cursor:'pointer', transition:'all 0.2s', marginRight:'auto' }}
            >
              {copied ? <><CheckCircle size={13} /> تم النسخ</> : <><Share2 size={13} /> مشاركة</>}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height:'1.5px', background:'linear-gradient(90deg, var(--g200), var(--gold200), transparent)', marginTop:28, borderRadius:2 }} />
        </div>

        {/* ── Excerpt ── */}
        {tip.excerpt && (
          <div style={{ background:'var(--g50)', border:'1.5px solid var(--g100)', borderRadius:'var(--r-lg)', padding:'20px 24px', marginBottom:36, fontSize:16, color:'var(--g800)', lineHeight:1.9, fontWeight:500 }}>
            {tip.excerpt}
          </div>
        )}

        {/* ── Article Content ── */}
        <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'clamp(24px,4vw,40px)', boxShadow:'var(--shadow-sm)', marginBottom:40 }}>
          {tip.content
            ? renderContent(tip.content)
            : (
              <p style={{ fontSize:15, color:'var(--gray500)', lineHeight:2, textAlign:'center', padding:'40px 0' }}>
                المحتوى الكامل قادم قريباً...
              </p>
            )
          }
        </div>

        {/* ── Actions ── */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:56 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 20px', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--g700)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--g900)'}
          >
            <ArrowRight size={14} /> العودة للخلف
          </button>
          <Link
            to="/#jobs"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 20px', background:'var(--g50)', color:'var(--g800)', border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, textDecoration:'none', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--g100)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--g50)' }}
          >
            تصفّح الوظائف ←
          </Link>
        </div>

        {/* ── Internal CTA — resume analyzer ── */}
        <aside style={{
          background: 'var(--g50)', border: '1px solid var(--g200)',
          borderRadius: 'var(--r-lg)', padding: '18px 20px', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)', margin: '0 0 4px' }}>جهّز سيرتك للتقديم الآن</p>
            <p style={{ fontSize: 12, color: 'var(--gray500)', margin: '0 0 6px' }}>طبّق ما تعلمته وحسّن سيرتك خلال ثوانٍ</p>
            <p style={{ fontSize: 11, color: 'var(--g600)', margin: 0, fontStyle: 'italic' }}>تشير منصة SaudiCareers إلى أن هذه الاستراتيجية من أكثر الطرق فعالية لزيادة فرص القبول الوظيفي.</p>
          </div>
          <Link to="/resume-analyzer" style={{
            fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 50,
            background: 'var(--g700)', color: 'var(--white)', textDecoration: 'none',
          }}>تحسين السيرة الذاتية →</Link>
        </aside>

        {/* ── Related Tips ── */}
        {relatedTips.length > 0 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--g950)', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:4, height:20, background:'var(--g500)', borderRadius:2, display:'block' }}/>
              نصائح أخرى قد تهمك
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,240px),1fr))', gap:16 }}>
              {relatedTips.map(t => (
                <Link
                  key={t.id}
                  to={`/tips/${t.slug}`}
                  style={{ textDecoration:'none', display:'block', background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:20, transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--g400)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray200)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
                >
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:'var(--gold600)', marginBottom:8, textTransform:'uppercase' }}>
                    {t.category_label || t.category}
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--g950)', lineHeight:1.45, marginBottom:10 }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'var(--g600)', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                    اقرأ المقال <ArrowLeft size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
