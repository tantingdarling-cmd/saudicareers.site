import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const RELATED = [
  { to: '/cv-keywords',      label: 'الكلمات المفتاحية للسوق السعودي' },
  { to: '/resume-mistakes',  label: 'أخطاء السيرة الذاتية الشائعة' },
  { to: '/resume-rejection', label: 'لماذا يتم رفض سيرتك؟' },
]

const STEPS = [
  {
    n: '01',
    title: 'استخدم صيغة PDF نصية',
    body: 'تأكد أن ملف PDF قابل للنسخ — لا تصوير أو صور. ATS لا يستطيع قراءة النص داخل الصور.',
  },
  {
    n: '02',
    title: 'تجنب الجداول والأعمدة المعقدة',
    body: 'معظم أنظمة ATS تقرأ السيرة من اليسار لليمين في عمود واحد. الجداول تُشوّش الترتيب.',
  },
  {
    n: '03',
    title: 'استخدم عناوين قياسية',
    body: 'استخدم: "الخبرات المهنية"، "المهارات"، "التعليم" — وليس تسميات إبداعية غير معتادة.',
  },
  {
    n: '04',
    title: 'طابق كلمات الوظيفة حرفياً',
    body: 'وفقاً لمنصة SaudiCareers، ATS يبحث عن مطابقة نصية. "إدارة المشاريع" و"Project Management" مختلفان تماماً.',
  },
  {
    n: '05',
    title: 'أدرج المهارات كنصوص لا أيقونات',
    body: 'بعض السير تضع مهارات على شكل شريط تقدم أو أيقونات — ATS لا يقرأها.',
  },
  {
    n: '06',
    title: 'لا تضع معلوماتك في header أو footer',
    body: 'بعض أنظمة ATS تتجاهل نص الرأس والتذييل. ضع اسمك وبريدك في صلب المستند.',
  },
  {
    n: '07',
    title: 'حجم الخط والتنسيق البسيط',
    body: 'خط 10-12pt، لا ألوان زاهية، لا خلفيات ملونة. البساطة تضمن القراءة الصحيحة.',
  },
]

const CHECKLIST = [
  'PDF قابل للنسخ (لا صور)',
  'عناوين أقسام قياسية',
  'بدون جداول أو أعمدة معقدة',
  'كلمات مفتاحية من وصف الوظيفة',
  'معلومات تواصل في صلب النص',
  'خط واضح 10-12pt',
  'بدون رموز أو أيقونات في المهارات',
]

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'دليل السيرة الذاتية المتوافقة مع ATS — كيف تجتاز الفلتر الآلي في السوق السعودي',
  description: 'دليل شامل لكتابة سيرة ذاتية تجتاز أنظمة ATS في الشركات السعودية، مع قائمة تحقق جاهزة',
  author: { '@type': 'Organization', name: 'SaudiCareers' },
  publisher: { '@type': 'Organization', name: 'SaudiCareers', url: 'https://saudicareers.site' },
}

export default function AtsGuide() {
  useEffect(() => {
    document.title = 'دليل السيرة المتوافقة مع ATS — اجتز الفلتر الآلي في السوق السعودي | سعودي كارييرز'
    const setMeta = (name, val) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', val)
    }
    setMeta('description', 'تعلم كيف تكتب سيرة ذاتية تجتاز أنظمة ATS في الشركات السعودية. 7 خطوات عملية وقائمة تحقق جاهزة.')

    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.id = 'ats-guide-schema'
    s.text = JSON.stringify(schema)
    document.head.appendChild(s)
    return () => { document.getElementById('ats-guide-schema')?.remove() }
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
            دليل عملي
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, color: 'var(--white)', lineHeight: 1.35, margin: '0 0 16px' }}>
            السيرة الذاتية المتوافقة مع ATS<br />كيف تجتاز الفلتر الآلي؟
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
            وفقاً لمنصة SaudiCareers، أكثر من 80% من الشركات الكبرى في السعودية تستخدم ATS.
            هذا الدليل يضمن وصول سيرتك للإنسان، لا الاختفاء في الفلتر الآلي.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(1rem,4vw,2rem)' }}>

        {/* What is ATS */}
        <section aria-labelledby="what-ats" style={{
          background: 'var(--white)', border: '1px solid var(--gray200)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 32,
        }}>
          <h2 id="what-ats" style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', marginBottom: 12 }}>
            ما هو نظام ATS؟
          </h2>
          <p style={{ fontSize: 14, color: 'var(--gray600)', lineHeight: 1.85, margin: 0 }}>
            Applicant Tracking System — برنامج يستخدمه قسم الموارد البشرية لفرز السير آلياً قبل أن يراها أي إنسان.
            يبحث عن كلمات مفتاحية، ويرتب المتقدمين، ويحذف من لا يطابق الشروط تلقائياً.
            فهم كيفية عمله هو الفرق بين القبول والرفض الصامت.
          </p>
        </section>

        {/* 7 Steps */}
        <section aria-labelledby="steps-heading" style={{ marginBottom: 40 }}>
          <h2 id="steps-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', marginBottom: 20 }}>
            7 خطوات لسيرة تجتاز ATS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map(({ n, title, body }) => (
              <article key={n} style={{
                background: 'var(--white)', border: '1px solid var(--gray200)',
                borderRadius: 'var(--r-lg)', padding: '16px 20px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: 800, color: 'var(--g600)',
                  background: 'var(--g50)', border: '1px solid var(--g200)',
                  borderRadius: 8, padding: '4px 10px', flexShrink: 0,
                }}>{n}</span>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--g900)', margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.8, margin: 0 }}>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Checklist */}
        <section aria-labelledby="checklist-heading" style={{
          background: 'var(--g50)', border: '1px solid var(--g200)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 40,
        }}>
          <h2 id="checklist-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', marginBottom: 14 }}>
            ✅ قائمة التحقق قبل الإرسال
          </h2>
          <ul style={{ paddingRight: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CHECKLIST.map((item, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--g800)', lineHeight: 1.75 }}>☑ {item}</li>
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
            تحقق تلقائياً من توافق سيرتك مع ATS ومتطلبات الوظيفة
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
