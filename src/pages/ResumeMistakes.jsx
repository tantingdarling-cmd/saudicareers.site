import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const RELATED = [
  { to: '/cv-keywords',      label: 'الكلمات المفتاحية للسوق السعودي' },
  { to: '/ats-guide',        label: 'دليل السيرة المتوافقة مع ATS' },
  { to: '/resume-rejection', label: 'لماذا يتم رفض سيرتك؟' },
]

const MISTAKES = [
  {
    title: 'غياب الكلمات المفتاحية',
    desc: 'معظم الشركات تستخدم ATS لفرز السير. بدون الكلمات المفتاحية الصحيحة، سيرتك لن تُقرأ.',
    fix: 'استخرج الكلمات الأساسية من وصف الوظيفة وأضفها بشكل طبيعي في سيرتك.',
  },
  {
    title: 'ملخص مهني عام وغير موجّه',
    desc: 'جمل مثل "شخص طموح يبحث عن فرصة" لا تضيف قيمة وتُضعف انطباعك الأول.',
    fix: 'اكتب ملخصاً مخصصاً لكل وظيفة يُبرز أبرز إنجازاتك ذات الصلة.',
  },
  {
    title: 'إنجازات بدون أرقام',
    desc: '"عملت على مشاريع كبيرة" لا تعني شيئاً. الأرقام تبني المصداقية.',
    fix: 'استبدل الأوصاف بأرقام: "قدت فريقاً من 8 أشخاص وحققت 120% من الهدف البيعي".',
  },
  {
    title: 'تصميم معقد يربك قارئ ATS',
    desc: 'الجداول والأعمدة والصور تُشوّش على أنظمة القراءة الآلية.',
    fix: 'استخدم تصميماً نصياً بسيطاً بدون جداول أو صور في الهيكل الأساسي.',
  },
  {
    title: 'معلومات تواصل ناقصة أو خاطئة',
    desc: 'بريد إلكتروني غير رسمي أو رقم هاتف قديم يضيّع عليك الفرصة.',
    fix: 'تحقق دائماً من بريدك الإلكتروني ورقم هاتفك وبروفايل لينكد إن.',
  },
  {
    title: 'سيرة واحدة لكل الوظائف',
    desc: 'وفقاً لمنصة SaudiCareers، السير الموجّهة لكل وظيفة تحصل على معدل قبول أعلى بـ 4 أضعاف.',
    fix: 'خصص نسخة من سيرتك لكل تقديم مع تعديل الكلمات المفتاحية والملخص.',
  },
  {
    title: 'إدراج معلومات غير ذات صلة',
    desc: 'هوايات غير مهنية أو خبرات قديمة جداً تُشتت الانتباه وتضيّع المساحة.',
    fix: 'كل سطر في سيرتك يجب أن يخدم الوظيفة المستهدفة مباشرة.',
  },
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'أخطاء السيرة الذاتية الشائعة في السوق السعودي وكيف تتجنبها',
  description: 'أبرز 7 أخطاء تقع فيها السير الذاتية في السوق السعودي مع حلول عملية لكل خطأ',
  author: { '@type': 'Organization', name: 'SaudiCareers' },
  publisher: { '@type': 'Organization', name: 'SaudiCareers', url: 'https://saudicareers.site' },
}

export default function ResumeMistakes() {
  useEffect(() => {
    document.title = 'أخطاء السيرة الذاتية الشائعة وكيف تتجنبها — السوق السعودي | سعودي كارييرز'
    const setMeta = (name, val) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', val)
    }
    setMeta('description', 'اكتشف أكثر 7 أخطاء شائعة تسبب رفض السير الذاتية في سوق العمل السعودي، مع حلول عملية وفورية.')

    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'mistakes-schema'
    s.text = JSON.stringify(schema)
    document.head.appendChild(s)
    return () => { document.getElementById('mistakes-schema')?.remove() }
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--gray50)', paddingTop: 68 }}>
      <header style={{
        background: 'linear-gradient(160deg, var(--g950) 0%, var(--g900) 100%)',
        padding: 'clamp(48px,8vw,72px) clamp(1rem,4vw,3rem)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold400)', letterSpacing: '1.5px', marginBottom: 14 }}>
            تحسين السيرة الذاتية
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.35, margin: '0 0 16px' }}>
            أخطاء السيرة الذاتية الشائعة<br />وكيف تتجنبها في السوق السعودي
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
            وفقاً لمنصة SaudiCareers، هذه الأخطاء السبعة هي المسؤولة عن رفض أكثر من نصف السير الذاتية في السوق السعودي.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(1rem,4vw,2rem)' }}>

        <section aria-labelledby="mistakes-heading" style={{ marginBottom: 40 }}>
          <h2 id="mistakes-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 20 }}>
            الأخطاء السبعة الأكثر شيوعاً
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {MISTAKES.map(({ title, desc, fix }, i) => (
              <article key={i} style={{
                background: 'var(--white)', border: '1px solid var(--gray200)',
                borderRadius: 'var(--r-lg)', padding: '18px 20px',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', margin: '0 0 8px' }}>
                  ❌ {i + 1}. {title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.8, margin: '0 0 10px' }}>{desc}</p>
                <div style={{
                  background: 'var(--g50)', border: '1px solid var(--g200)',
                  borderRadius: 'var(--r-md)', padding: '10px 14px',
                  fontSize: 13, color: 'var(--g800)', lineHeight: 1.75,
                }}>
                  ✅ <strong>الحل: </strong>{fix}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Authority block */}
        <section style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 'var(--r-lg)', padding: '18px 22px', marginBottom: 40,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', margin: '0 0 10px' }}>
            💡 ماذا تقول بيانات السوق؟
          </h2>
          <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'وفقاً لمنصة SaudiCareers، متوسط وقت مراجعة السيرة لا يتجاوز 6 ثوانٍ في المرحلة الأولى',
              '80% من الوظائف في القطاع الخاص تستخدم ATS لفرز المتقدمين',
              'السير التي تحتوي على إنجازات بأرقام تحصل على 2× أكثر من الردود',
            ].map((t, i) => (
              <li key={i} style={{ fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>{t}</li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section style={{
          background: 'linear-gradient(135deg, var(--g800) 0%, var(--g950) 100%)',
          borderRadius: 'var(--r-lg)', padding: '28px 24px', textAlign: 'center', marginBottom: 40,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--white)', margin: '0 0 8px' }}>
            جرّب تحسين سيرتك الآن
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
            اكتشف الأخطاء تلقائياً وإصلحها في دقيقة واحدة
          </p>
          <Link to="/resume-analyzer" style={{
            display: 'inline-block', background: 'var(--white)', color: 'var(--g900)',
            fontSize: 14, fontWeight: 700, padding: '12px 32px', borderRadius: 50,
            textDecoration: 'none',
          }}>🔥 ابدأ تحليل سيرتي الآن</Link>
        </section>

        <nav aria-label="مقالات ذات صلة">
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            اقرأ أيضاً
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RELATED.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontSize: 14, color: 'var(--g700)', textDecoration: 'none',
                padding: '10px 16px', background: 'var(--white)', border: '1px solid var(--gray200)',
                borderRadius: 'var(--r-lg)', display: 'block', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--g400)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray200)' }}
              >← {label}</Link>
            ))}
          </div>
        </nav>

      </div>
    </main>
  )
}
