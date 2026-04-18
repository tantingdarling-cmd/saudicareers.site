import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Clock, Share2, BookOpen, ArrowLeft } from 'lucide-react'
import { tipsApi, subscribersApi } from '../services/api'

const CATEGORIES = [
  { key: 'all',        label: 'الكل',       emoji: '📋' },
  { key: 'cv',         label: 'سير ذاتية',  emoji: '📄' },
  { key: 'salary',     label: 'رواتب',       emoji: '💰' },
  { key: 'interview',  label: 'مقابلات',    emoji: '🎯' },
  { key: 'skills',     label: 'مهارات',     emoji: '⚡' },
  { key: 'fresh_grad', label: 'خريجون',     emoji: '🚀' },
  { key: 'linkedin',   label: 'لينكد إن',  emoji: '🔗' },
]

const CATEGORY_COLORS = {
  cv:         { bg: 'rgba(197,160,89,0.08)',  color: '#92611C', border: 'rgba(197,160,89,0.25)' },
  salary:     { bg: 'rgba(22,163,74,0.08)',   color: '#15803D', border: 'rgba(22,163,74,0.2)' },
  interview:  { bg: 'rgba(0,61,43,0.08)',     color: '#003D2B', border: 'rgba(0,61,43,0.18)' },
  skills:     { bg: 'rgba(99,102,241,0.08)',  color: '#4338CA', border: 'rgba(99,102,241,0.2)' },
  fresh_grad: { bg: 'rgba(14,165,233,0.08)', color: '#0369A1', border: 'rgba(14,165,233,0.2)' },
  linkedin:   { bg: 'rgba(37,99,235,0.08)',  color: '#1D4ED8', border: 'rgba(37,99,235,0.2)' },
  career:     { bg: 'rgba(0,61,43,0.06)',     color: '#003D2B', border: 'rgba(0,61,43,0.15)' },
}

function useDebounce(v, d) {
  const [dv, setDv] = useState(v)
  useEffect(() => { const t = setTimeout(() => setDv(v), d); return () => clearTimeout(t) }, [v, d])
  return dv
}

function TipSkeleton() {
  return (
    <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 20, padding: 24 }}>
      {[80, 100, 60, 40].map((w, i) => (
        <div key={i} style={{ height: i === 1 ? 20 : 12, width: `${w}%`, background: 'var(--gray100)', borderRadius: 6, marginBottom: 12,
          animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%',
          backgroundImage: 'linear-gradient(90deg,var(--gray100) 25%,var(--gray50) 50%,var(--gray100) 75%)' }} />
      ))}
    </div>
  )
}

function TipCard({ tip }) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const c = CATEGORY_COLORS[tip.category] || CATEGORY_COLORS.career
  const cat = CATEGORIES.find(c => c.key === tip.category)

  function share(e) {
    e.preventDefault(); e.stopPropagation()
    const url = `${window.location.origin}/tips/${tip.slug}?utm_source=social&utm_campaign=organic_w1`
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <Link
      to={`/tips/${tip.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--white)',
        border: hovered ? '1.5px solid var(--g400)' : '1.5px solid var(--gray200)',
        borderRadius: 20, padding: 24,
        textDecoration: 'none', color: 'inherit',
        transition: 'all 0.35s cubic-bezier(0.32,0.72,0,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : '0 4px 16px rgba(0,0,0,0.05)',
        position: 'relative',
      }}>

      {/* Category + share */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50,
          background: c.bg, color: c.color, border: `1px solid ${c.border}`,
        }}>
          {cat?.emoji} {tip.category_label || cat?.label}
        </span>
        <button
          onClick={share}
          title="نسخ الرابط"
          style={{
            border: 'none', background: copied ? 'rgba(22,163,74,0.08)' : 'var(--gray100)',
            color: copied ? '#15803D' : 'var(--gray400)',
            width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { if (!copied) e.currentTarget.style.background = 'var(--g50)' }}
          onMouseLeave={e => { if (!copied) e.currentTarget.style.background = 'var(--gray100)' }}
        >
          {copied ? '✓' : <Share2 size={13} />}
        </button>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g950)', lineHeight: 1.45, marginBottom: 10, margin: '0 0 10px' }}>
        {tip.title}
      </h3>

      {/* Excerpt */}
      {tip.excerpt && (
        <p style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.8, marginBottom: 16, flex: 1 }}>
          {tip.excerpt.length > 120 ? tip.excerpt.slice(0, 120) + '...' : tip.excerpt}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--gray100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray400)' }}>
          <Clock size={12} />
          {tip.read_time ? `${tip.read_time} دقائق` : '3 دقائق'}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: hovered ? 'var(--g700)' : 'var(--gray400)', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}>
          اقرأ الآن <ArrowLeft size={12} />
        </span>
      </div>
    </Link>
  )
}

function NewsletterBox() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!email.includes('@')) return
    setLoading(true)
    try {
      await subscribersApi.subscribe({ email, name: '', field: '' })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--g950) 0%, var(--g900) 100%)',
      borderRadius: 24, padding: 'clamp(32px,5vw,48px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      textAlign: 'center', marginTop: 64,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold400)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        📬 نشرة أسبوعية
      </div>
      <h3 style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
        أفضل النصائح مباشرة في بريدك
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 420 }}>
        كل أسبوع: نصيحة واحدة صادقة وقابلة للتطبيق في سوق العمل السعودي
      </p>
      {done ? (
        <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 12, padding: '12px 24px', color: '#4ADE80', fontWeight: 600 }}>
          ✓ تم الاشتراك! سنتواصل معك قريباً
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 400, flexWrap: 'wrap' }}>
          <input
            type="email" placeholder="بريدك الإلكتروني" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={{
              flex: 1, minWidth: 200, padding: '12px 18px',
              border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
              fontSize: 14, fontFamily: 'var(--font-ar)', outline: 'none', textAlign: 'right',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold400)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
          />
          <button type="submit" disabled={loading} style={{
            padding: '12px 24px', background: 'linear-gradient(135deg,var(--gold500),var(--gold400))',
            color: 'var(--g950)', border: 'none', borderRadius: 'var(--r-md)',
            fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}>
            {loading ? '...' : 'اشترك'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function Tips() {
  const [tips, setTips]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [category, setCategory]   = useState('all')
  const [search, setSearch]       = useState('')
  const debouncedSearch           = useDebounce(search, 350)
  const searchRef                 = useRef(null)

  useEffect(() => {
    setLoading(true)
    const params = { per_page: 50 }
    if (category !== 'all') params.category = category
    if (debouncedSearch) params.q = debouncedSearch

    tipsApi.getAll(params)
      .then(res => {
        const data = res?.data
        setTips(Array.isArray(data) ? data : [])
      })
      .catch(() => setTips([]))
      .finally(() => setLoading(false))
  }, [category, debouncedSearch])

  // SEO
  useEffect(() => {
    document.title = 'نصائح سوق العمل السعودي | Saudi Careers'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = 'نصائح صادقة وعملية لسوق العمل السعودي: سيرة ذاتية، رواتب، مقابلات، مهارات التوطين'
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray50)', paddingTop: 68 }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--g950) 0%, var(--g900) 60%, var(--g800) 100%)',
        padding: 'clamp(48px,8vw,80px) clamp(1rem,4vw,3rem) clamp(40px,6vw,64px)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold400)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
            💡 مركز النصائح
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.25, marginBottom: 16 }}>
            نصائح سوق العمل السعودي
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, marginBottom: 32 }}>
            حقائق صادقة لكن حقيقية — مبنية على بيانات السوق السعودي
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              type="text" placeholder="ابحث في النصائح..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 44px 14px 18px',
                background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: 50, color: 'var(--white)', fontSize: 14,
                fontFamily: 'var(--font-ar)', outline: 'none', textAlign: 'right',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold400)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(1rem,4vw,3rem)' }}>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36, justifyContent: 'center' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.key
            return (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                padding: '8px 18px', borderRadius: 50, cursor: 'pointer',
                fontFamily: 'var(--font-ar)', fontSize: 13, fontWeight: active ? 700 : 500,
                border: active ? '1.5px solid var(--g700)' : '1.5px solid var(--gray200)',
                background: active ? 'var(--g900)' : 'var(--white)',
                color: active ? 'var(--white)' : 'var(--gray600)',
                transition: 'all 0.2s cubic-bezier(0.32,0.72,0,1)',
                boxShadow: active ? '0 4px 12px rgba(0,61,43,0.2)' : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--g50)'; e.currentTarget.style.color = 'var(--g800)' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--gray600)' } }}>
                {cat.emoji} {cat.label}
              </button>
            )
          })}
        </div>

        {/* Results count */}
        {!loading && (
          <div style={{ fontSize: 13, color: 'var(--gray400)', marginBottom: 20, textAlign: 'center' }}>
            {tips.length === 0 ? 'لا توجد نصائح' : `${tips.length} نصيحة`}
            {search && ` — نتائج البحث عن "${search}"`}
          </div>
        )}

        {/* Tips grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 20 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TipSkeleton key={i} />)
            : tips.length === 0
              ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--gray400)' }}>
                  <BookOpen size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                  <p style={{ fontSize: 15 }}>لا توجد نصائح في هذا التصنيف</p>
                </div>
              )
              : tips.map(tip => <TipCard key={tip.id} tip={tip} />)
          }
        </div>

        <NewsletterBox />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        ::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
