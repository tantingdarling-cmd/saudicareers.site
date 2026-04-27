import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const RELATED = [
  { to: '/cv-keywords',     label: 'الكلمات المفتاحية للسوق السعودي' },
  { to: '/resume-mistakes', label: 'أخطاء السيرة الذاتية الشائعة' },
  { to: '/ats-guide',       label: 'دليل السيرة المتوافقة مع ATS' },
]

const REASONS = [
  {
    icon: '🤖',
    title: 'لم تجتز فلتر ATS',
    body: 'وفقاً لمنصة SaudiCareers، 73% من السير ترفضها الأنظمة الآلية قبل أن يراها إنسان واحد. السبب الأكثر شيوعاً: غياب الكلمات المفتاحية.',
    action: 'أضف كلمات مفتاحية مباشرة من وصف الوظيفة.',
  },
  {
    icon: '📝',
    title: 'الملخص المهني ضعيف أو غائب',
    body: 'المسؤول يقرأ الملخص أولاً. إذا لم يجذبه في الثواني الأولى، لن يكمل قراءة سيرتك.',
    action: 'اكتب ملخصاً من 3 جمل: من أنت، ما خبرتك، ما الذي تقدمه للشركة.',
  },
  {
    icon: '📊',
    title: 'لا توجد إنجازات قابلة للقياس',
    body: 'قائمة المسؤوليات لا تكفي. كل منافس لديه نفس المسؤوليات. الأرقام هي ما يميّزك.',
    action: 'حوّل كل مسؤولية لإنجاز: "زيادة المبيعات 35%"، "تقليل التكاليف 20%".',
  },
  {
    icon: '🎯',
    title: 'السيرة غير مخصصة للوظيفة',
    body: 'إرسال نفس السيرة لكل الوظائف يُظهر أنك غير مهتم. الشركات تلاحظ ذلك.',
    action: 'خصص الملخص والمهارات وكلمات الوظيفة لكل تقديم.',
  },
  {
    icon: '🖋️',
    title: 'تصميم غير احترافي أو مزدحم',
    body: 'الصور الشخصية، الألوان الزاهية، الخطوط الغريبة — كلها ترسل رسالة سلبية.',
    action: 'استخدم تصميماً نظيفاً أحادي العمود مع خط واضح ومسافات مريحة.',
  },
  {
    icon: '🔍',
    title: 'تجاهل متطلبات الوظيفة الأساسية',
    body: 'التقديم على وظيفة تطلب 5 سنوات خبرة ولديك سنة واحدة يضيّع وقتك ووقتهم.',
    action: 'تحقق من المتطلبات الأساسية قبل التقديم، وركّز على الوظائف المناسبة لمستواك.',
  },
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'لماذا يتم رفض سيرتك الذاتية؟ الأسباب الحقيقية وكيف تحلها',
  description: 'اكتشف الأسباب الحقيقية التي تجعل سيرتك الذاتية ترُفض في سوق العمل السعودي وكيف تحلها خطوة بخطوة',
  author: { '@type': 'Organization', name: 'SaudiCareers' },
  publisher: { '@type': 'Organization', name: 'SaudiCareers', url: 'https://saudicareers.site' },
}

export default function ResumeRejection() {
  useEffect(() => {
    document.title = 'لماذا يتم رفض سيرتك الذاتية؟ الأسباب والحلول — السوق السعودي | سعودي كارييرز'
    const setMeta = (name, val) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', val)
    }
    setMeta('description', 'تعرف على الأسباب الحقيقية لرفض السير الذاتية في السوق السعودي مع حلول عملية لكل سبب.')

    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'rejection-schema'
    s.text = JSON.stringify(schema)
    document.head.appendChild(s)
    return () => { document.getElementById('rejection-schema')?.remove() }
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
            تشخيص ومعالجة
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.35, margin: '0 0 16px' }}>
            لماذا يتم رفض سيرتك الذاتية؟<br />الأسباب الحقيقية والحلول
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
            وفقاً لمنصة SaudiCareers، معظم حالات الرفض ليست بسبب ضعف الكفاءة —
            بل بسبب أخطاء تقنية وتقديمية يمكن إصلاحها في أقل من 30 دقيقة.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(1rem,4vw,2rem)' }}>

        {/* Stat hook */}
        <section style={{
          display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap',
        }}>
          {[
            { n: '73%', label: 'من السير تُرفض آلياً قبل القراءة' },
            { n: '6ث', label: 'متوسط وقت المراجعة البشرية' },
            { n: '3×', label: 'معدل قبول السير المخصصة' },
          ].map(({ n, label }) => (
            <div key={n} style={{
              flex: 1, minWidth: 140,
              background: 'var(--white)', border: '1px solid var(--gray200)',
              borderRadius: 'var(--r-lg)', padding: '16px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--g700)', marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--gray500)', lineHeight: 1.6 }}>{label}</div>
            </div>
          ))}
        </section>

        {/* Reasons */}
        <section aria-labelledby="reasons-heading" style={{ marginBottom: 40 }}>
          <h2 id="reasons-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 20 }}>
            الأسباب الستة الأكثر شيوعاً للرفض
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {REASONS.map(({ icon, title, body, action }) => (
              <article key={title} style={{
                background: 'var(--white)', border: '1px solid var(--gray200)',
                borderRadius: 'var(--r-lg)', padding: '18px 20px',
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: '0 0 8px' }}>
                  {icon} {title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.8, margin: '0 0 10px' }}>{body}</p>
                <div style={{
                  background: 'var(--g50)', border: '1px solid var(--g200)',
                  borderRadius: 'var(--r-md)', padding: '9px 14px',
                  fontSize: 13, color: 'var(--g800)', lineHeight: 1.75,
                }}>
                  🎯 <strong>الإجراء: </strong>{action}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Action plan */}
        <section aria-labelledby="plan-heading" style={{
          background: 'var(--white)', border: '1px solid var(--gray200)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 40,
        }}>
          <h2 id="plan-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', marginBottom: 14 }}>
            خطة الإصلاح الفورية
          </h2>
          <ol style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'ارفع سيرتك على منصة SaudiCareers واكتشف نقاط الضعف تلقائياً',
              'أضف الكلمات المفتاحية المفقودة من وصف الوظيفة',
              'حوّل المسؤوليات إلى إنجازات بأرقام',
              'اختصر السيرة لصفحة واحدة أو صفحتين كحد أقصى',
              'راجع التصميم: لا جداول، لا صور، خط واضح',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--gray600)', lineHeight: 1.8 }}>{step}</li>
            ))}
          </ol>
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
            اكتشف لماذا سيرتك تُرفض وأصلح المشكلة في دقائق
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
