import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const s = {
  page:    { maxWidth: 780, margin: '0 auto', padding: 'clamp(80px,10vw,120px) clamp(1rem,4vw,2.5rem) clamp(60px,8vw,100px)', direction: 'rtl', fontFamily: 'var(--font-ar)' },
  back:    { display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--g700)', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 40 },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)', marginBottom: 12 },
  h1:      { fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 700, color: 'var(--g950)', lineHeight: 1.25, marginBottom: 10 },
  date:    { fontSize: 13, color: 'var(--gray400)', marginBottom: 48 },
  h2:      { fontSize: '1.15rem', fontWeight: 700, color: 'var(--g900)', marginTop: 40, marginBottom: 12 },
  p:       { fontSize: '0.97rem', color: 'var(--gray600)', lineHeight: 1.9, marginBottom: 16 },
  li:      { fontSize: '0.97rem', color: 'var(--gray600)', lineHeight: 1.9, marginBottom: 8 },
  ul:      { paddingRight: 24, marginBottom: 16 },
  divider: { border: 'none', borderTop: '1px solid var(--gray100)', margin: '40px 0' },
}

export default function Terms() {
  useEffect(() => { document.title = 'شروط الاستخدام | سعودي كارييرز' }, [])

  return (
    <div style={s.page}>
      <Link to="/" style={s.back}>← العودة للرئيسية</Link>

      <div style={s.eyebrow}>السياسات والأحكام</div>
      <h1 style={s.h1}>شروط الاستخدام</h1>
      <p style={s.date}>آخر تحديث: أبريل 2026 · مُطبَّق على كافة مستخدمي منصة سعودي كارييرز</p>

      <h2 style={s.h2}>1. قبول الشروط</h2>
      <p style={s.p}>
        باستخدامك لمنصة سعودي كارييرز (saudicareers.site) أو أي من خدماتها، فإنك توافق على الالتزام بهذه الشروط. إن كنت تمثّل منشأة أو شركة، فإنك تُقرّ بأن لديك الصلاحية القانونية للالتزام بها نيابةً عنها.
      </p>

      <h2 style={s.h2}>2. وصف الخدمة</h2>
      <p style={s.p}>تُقدّم المنصة الخدمات التالية:</p>
      <ul style={s.ul}>
        <li style={s.li}>تحليل السيرة الذاتية آلياً وتقييم توافقها مع أنظمة ATS</li>
        <li style={s.li}>عرض فرص وظيفية مُختارة في السوق السعودي</li>
        <li style={s.li}>نصائح مهنية وتوجيهات لتطوير المسار الوظيفي</li>
        <li style={s.li}>إمكانية التقديم على الوظائف وإيصال الطلبات لأصحاب العمل</li>
      </ul>

      <h2 style={s.h2}>3. الأهلية والتسجيل</h2>
      <p style={s.p}>
        يُشترط لاستخدام المنصة أن يكون المستخدم بالغاً (18 عاماً فأكثر) وأن يكون مقيماً أو يسعى للعمل في المملكة العربية السعودية. بتقديم بياناتك، تُقرّ بصحتها ودقتها وتُلزم نفسك بتحديثها عند الحاجة.
      </p>

      <h2 style={s.h2}>4. استخدام خدمة تحليل السيرة الذاتية</h2>
      <ul style={s.ul}>
        <li style={s.li}>مقيّدة بـ 3 تحليلات لكل عنوان IP في الدقيقة الواحدة</li>
        <li style={s.li}>الحد الأقصى لحجم الملف 2 ميغابايت بصيغة PDF فقط</li>
        <li style={s.li}>يُحذف الملف المرفوع فورياً بعد اكتمال التحليل</li>
        <li style={s.li}>نتائج التحليل تُخزَّن مؤقتاً في متصفحك فقط ولا تُحفظ على خوادمنا</li>
        <li style={s.li}>الخدمة استرشادية ولا تُعدّ ضماناً لقبول طلب التوظيف</li>
      </ul>

      <h2 style={s.h2}>5. التقديم على الوظائف</h2>
      <p style={s.p}>
        عند تقديم طلبك عبر المنصة، توافق على مشاركة بياناتك (الاسم، البريد الإلكتروني، السيرة الذاتية) مع صاحب العمل المعلن. سعودي كارييرز وسيط تقني ولا تتدخل في قرارات التوظيف ولا تتحمل مسؤولية نتائجها.
      </p>

      <h2 style={s.h2}>6. حقوق الملكية الفكرية</h2>
      <p style={s.p}>
        جميع محتويات المنصة (النصوص، التصاميم، الشعارات، الكود المصدري) مملوكة لسعودي كارييرز أو مُرخَّصة لها. لا يجوز نسخها أو إعادة توزيعها أو استخدامها تجارياً دون إذن كتابي مسبق.
      </p>
      <p style={s.p}>
        محتوى سيرتك الذاتية ملكٌ لك. بتحميلها توافق على منحنا ترخيصاً محدوداً لمعالجتها آلياً بغرض تقديم خدمة التحليل فقط.
      </p>

      <h2 style={s.h2}>7. الاستخدام المحظور</h2>
      <p style={s.p}>يُحظر على المستخدمين:</p>
      <ul style={s.ul}>
        <li style={s.li}>إنشاء حسابات آلية أو استخدام بوتات لاستخراج البيانات (Scraping)</li>
        <li style={s.li}>رفع محتوى مضلّل أو انتهاك حقوق طرف ثالث</li>
        <li style={s.li}>محاولة اختراق الأنظمة أو التلاعب بنتائج التحليل</li>
        <li style={s.li}>استخدام المنصة لأغراض غير مشروعة أو مخالفة لأنظمة المملكة العربية السعودية</li>
      </ul>

      <h2 style={s.h2}>8. إخلاء المسؤولية والضمانات</h2>
      <p style={s.p}>
        تُقدَّم المنصة "كما هي" دون ضمانات صريحة أو ضمنية. لا نضمن دقة نتائج تحليل السيرة الذاتية أو توفّر الوظائف المعلنة في أي وقت. لا نتحمل مسؤولية أي خسائر ناجمة عن اعتمادك على محتوى المنصة.
      </p>

      <h2 style={s.h2}>9. تعليق الحساب وإنهاء الخدمة</h2>
      <p style={s.p}>
        نحتفظ بالحق في تعليق أو إنهاء وصول أي مستخدم ينتهك هذه الشروط أو يُسيء استخدام الخدمة، مع إخطاره بالأسباب كلما أمكن ذلك.
      </p>

      <h2 style={s.h2}>10. القانون المُطبَّق وتسوية النزاعات</h2>
      <p style={s.p}>
        تخضع هذه الشروط لأنظمة المملكة العربية السعودية وتُفسَّر وفقها. تُحسم أي نزاعات تعذّر تسويتها وديّاً أمام المحاكم السعودية المختصة.
      </p>

      <h2 style={s.h2}>11. التغييرات على الشروط</h2>
      <p style={s.p}>
        قد نُعدّل هذه الشروط دورياً. سنُخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني المسجّل. استمرارك في استخدام المنصة بعد التحديث يُعدّ قبولاً للشروط الجديدة.
      </p>

      <h2 style={s.h2}>12. التواصل</h2>
      <p style={s.p}>
        لأي استفسار حول هذه الشروط: <strong>legal@saudicareers.site</strong>
      </p>

      <hr style={s.divider}/>
      <p style={{ ...s.p, fontSize: 13, color: 'var(--gray400)', textAlign: 'center' }}>
        © {new Date().getFullYear()} سعودي كارييرز · جميع الحقوق محفوظة ·{' '}
        <Link to="/privacy" style={{ color: 'var(--g700)', textDecoration: 'none' }}>سياسة الخصوصية</Link>
      </p>
    </div>
  )
}
