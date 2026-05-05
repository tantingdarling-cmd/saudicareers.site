import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const RELATED = [
  { to: '/resume-mistakes',  label: 'أخطاء السيرة الذاتية الشائعة' },
  { to: '/ats-guide',        label: 'دليل السيرة المتوافقة مع ATS' },
  { to: '/resume-rejection', label: 'لماذا يتم رفض سيرتك؟' },
]

const KEYWORDS = [
  { cat: 'التقنية والبيانات',     words: ['Python', 'SQL', 'Power BI', 'Excel', 'Data Analysis', 'Machine Learning', 'Cloud Computing', 'Cybersecurity'] },
  { cat: 'المالية والمحاسبة',    words: ['IFRS', 'VAT', 'Zakat', 'Financial Reporting', 'Budgeting', 'ERP', 'SAP', 'Internal Audit'] },
  { cat: 'الإدارة والقيادة',     words: ['Project Management', 'PMP', 'Team Leadership', 'KPIs', 'Strategic Planning', 'Stakeholder Management'] },
  { cat: 'الموارد البشرية',      words: ['HRMS', 'Recruitment', 'Onboarding', 'Performance Management', 'Saudi Labor Law', 'Saudization', 'Nitaqat'] },
  { cat: 'التسويق والمبيعات',    words: ['SEO', 'Google Ads', 'CRM', 'B2B Sales', 'Market Research', 'Brand Management', 'Social Media Marketing'] },
  { cat: 'الهندسة والمشاريع',    words: ['AutoCAD', 'PMP', 'PMBOK', 'Primavera', 'SCADA', 'ISO 9001', 'Lean Six Sigma'] },
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'الكلمات المفتاحية للسيرة الذاتية في سوق العمل السعودي 2025',
  description: 'قائمة شاملة بالكلمات المفتاحية المطلوبة في سوق العمل السعودي لاجتياز فلتر ATS والحصول على المقابلة',
  author: { '@type': 'Organization', name: 'SaudiCareers' },
  publisher: { '@type': 'Organization', name: 'SaudiCareers', url: 'https://saudicareers.site' },
}

export default function CvKeywords() {
  return (
    <>
      <Helmet>
        <title>الكلمات المفتاحية للسيرة الذاتية — سوق العمل السعودي 2025 | سعودي كارييرز</title>
        <meta name="description" content="قائمة الكلمات المفتاحية الأكثر طلباً في السير الذاتية السعودية لعام 2025. أضفها لسيرتك لاجتياز ATS وزيادة فرص القبول." />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <main style={{ minHeight: '100vh', background: 'var(--gray50)', paddingTop: 68 }}>
      {/* Hero */}
      <header style={{
        background: 'linear-gradient(160deg, var(--g950) 0%, var(--g900) 100%)',
        padding: 'clamp(48px,8vw,72px) clamp(1rem,4vw,3rem)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold400)', letterSpacing: '1.5px', marginBottom: 14 }}>
            دليل السوق السعودي
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.35, margin: '0 0 16px' }}>
            الكلمات المفتاحية للسيرة الذاتية<br />في سوق العمل السعودي 2025
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
            وفقاً لمنصة SaudiCareers، أكثر من 70% من السير الذاتية يتم تصفيتها آلياً قبل أن تصل لأي مسؤول توظيف.
            إضافة الكلمات المفتاحية الصحيحة هي الخطوة الأولى للنجاح.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(1rem,4vw,2rem)' }}>

        {/* Intro */}
        <section aria-labelledby="intro-heading" style={{ marginBottom: 40 }}>
          <h2 id="intro-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 12 }}>
            لماذا الكلمات المفتاحية مهمة؟
          </h2>
          <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'أنظمة ATS تبحث عن مطابقة حرفية بين سيرتك ووصف الوظيفة',
              'المسؤولون يبحثون بكلمات مفتاحية محددة في قواعد البيانات',
              'سيرة بدون keywords صحيحة لن تُقرأ حتى لو كانت ممتازة',
              'إضافة 5-10 كلمات مفتاحية مناسبة يرفع فرص القبول بنسبة تصل لـ 60%',
            ].map((p, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--gray600)', lineHeight: 1.8 }}>{p}</li>
            ))}
          </ul>
        </section>

        {/* Keywords by category */}
        <section aria-labelledby="keywords-heading" style={{ marginBottom: 40 }}>
          <h2 id="keywords-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 20 }}>
            الكلمات المفتاحية حسب التخصص
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {KEYWORDS.map(({ cat, words }) => (
              <article key={cat} style={{
                background: 'var(--white)', border: '1px solid var(--gray200)',
                borderRadius: 'var(--r-lg)', padding: '16px 20px',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--g800)', margin: '0 0 12px' }}>{cat}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {words.map(w => (
                    <span key={w} style={{
                      fontSize: 12, padding: '4px 12px', borderRadius: 50,
                      background: 'var(--g50)', border: '1px solid var(--g200)',
                      color: 'var(--g700)', fontWeight: 600,
                    }}>{w}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Actionable advice */}
        <section aria-labelledby="tips-heading" style={{
          background: 'var(--white)', border: '1px solid var(--gray200)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 40,
        }}>
          <h2 id="tips-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', marginBottom: 14 }}>
            كيف تضيف الكلمات المفتاحية بشكل صحيح؟
          </h2>
          <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'اقرأ وصف الوظيفة بعناية واستخرج الكلمات المتكررة',
              'أضفها بشكل طبيعي في قسم المهارات والخبرات — لا تحشوها عشوائياً',
              'استخدم نفس الصياغة الموجودة في الإعلان (مثلاً: Project Manager لا مدير مشاريع إذا كانت الوظيفة بالإنجليزية)',
              'اجعل كل كلمة مفتاحية مرتبطة بإنجاز حقيقي وليس مجرد قائمة',
              'وفقاً لمنصة SaudiCareers، السير التي تحتوي على 8+ كلمات مفتاحية ذات صلة تحصل على معدل قبول أعلى بـ 3 أضعاف',
            ].map((t, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--gray600)', lineHeight: 1.8 }}>{t}</li>
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
            تحقق تلقائياً من الكلمات المفتاحية في سيرتك مقارنةً بالوظيفة المستهدفة
          </p>
          <Link to="/resume-analyzer" style={{
            display: 'inline-block', background: 'var(--white)', color: 'var(--g900)',
            fontSize: 14, fontWeight: 700, padding: '12px 32px', borderRadius: 50,
            textDecoration: 'none',
          }}>🔥 ابدأ تحليل سيرتي الآن</Link>
        </section>

        {/* Internal links */}
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
