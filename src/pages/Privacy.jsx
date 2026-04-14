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
  box:     { background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 24 },
}

export default function Privacy() {
  useEffect(() => { document.title = 'سياسة الخصوصية | سعودي كارييرز' }, [])

  return (
    <div style={s.page}>
      <Link to="/" style={s.back}>← العودة للرئيسية</Link>

      <div style={s.eyebrow}>السياسات والأحكام</div>
      <h1 style={s.h1}>سياسة الخصوصية</h1>
      <p style={s.date}>آخر تحديث: أبريل 2026 · مُطابقة لنظام حماية البيانات الشخصية السعودي (PDPL)</p>

      <div style={s.box}>
        <p style={{ ...s.p, marginBottom: 0, color: 'var(--g700)', fontWeight: 500 }}>
          منصة سعودي كارييرز ملتزمة بحماية بياناتك الشخصية وفق <strong>نظام حماية البيانات الشخصية (PDPL)</strong> الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته، ولوائحه التنفيذية الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).
        </p>
      </div>

      <hr style={s.divider}/>

      <h2 style={s.h2}>1. من نحن</h2>
      <p style={s.p}>
        سعودي كارييرز منصة إلكترونية تهدف إلى ربط الباحثين عن عمل بفرص وظيفية مناسبة في سوق العمل السعودي، وتقديم خدمات تحليل السيرة الذاتية والنصائح المهنية. نتولى معالجة بياناتك الشخصية بوصفنا مُتحكماً في البيانات وفق تعريف النظام.
      </p>

      <h2 style={s.h2}>2. البيانات التي نجمعها</h2>
      <p style={s.p}>نجمع البيانات التالية عند استخدامك للمنصة:</p>
      <ul style={s.ul}>
        <li style={s.li}><strong>بيانات التسجيل:</strong> الاسم، البريد الإلكتروني، المجال المهني</li>
        <li style={s.li}><strong>بيانات التقديم الوظيفي:</strong> الاسم، البريد الإلكتروني، رقم الجوال (اختياري)، ملف السيرة الذاتية</li>
        <li style={s.li}><strong>بيانات تحليل السيرة الذاتية:</strong> محتوى ملف PDF المرفوع لأغراض التحليل الآلي</li>
        <li style={s.li}><strong>بيانات الاستخدام:</strong> عنوان IP، نوع المتصفح، الصفحات المُزارة، وأوقات الوصول</li>
      </ul>

      <h2 style={s.h2}>3. أغراض معالجة البيانات والأساس القانوني</h2>
      <p style={s.p}>نعالج بياناتك استناداً إلى الأسس القانونية التالية وفق المادة (5) من النظام:</p>
      <ul style={s.ul}>
        <li style={s.li}><strong>الموافقة الصريحة:</strong> لتحليل السيرة الذاتية وإرسال التحديثات المهنية — تُقدَّم عند رفع ملفك مع توثيق وقت الموافقة</li>
        <li style={s.li}><strong>تنفيذ عقد أو ترتيب تعاقدي:</strong> لمعالجة طلبات التقديم الوظيفي وإيصالها لأصحاب العمل</li>
        <li style={s.li}><strong>المصلحة المشروعة:</strong> لتحسين خدمات المنصة وتأمين بنيتها التحتية</li>
        <li style={s.li}><strong>الالتزام بالتزام قانوني:</strong> للاستجابة لطلبات الجهات الرقابية السعودية المختصة</li>
      </ul>

      <h2 style={s.h2}>4. مشاركة البيانات مع أطراف ثالثة</h2>
      <p style={s.p}>لا نبيع بياناتك الشخصية. قد نشارك البيانات في الحالات التالية فقط:</p>
      <ul style={s.ul}>
        <li style={s.li}>مع أصحاب العمل المعلنين عن وظائف — لبيانات التقديم المقدَّمة صراحةً</li>
        <li style={s.li}>مع مزودي الخدمات التقنية (الاستضافة، البريد الإلكتروني) وفق اتفاقيات معالجة بيانات صارمة</li>
        <li style={s.li}>بموجب أوامر قضائية أو طلبات الجهات الحكومية السعودية المختصة</li>
      </ul>

      <h2 style={s.h2}>5. مدة الاحتفاظ بالبيانات</h2>
      <ul style={s.ul}>
        <li style={s.li}><strong>ملفات السيرة الذاتية المرفوعة للتحليل:</strong> تُحذف فورياً بعد اكتمال التحليل</li>
        <li style={s.li}><strong>بيانات الاشتراك البريدي:</strong> طوال فترة الاشتراك + 30 يوماً بعد طلب الإلغاء</li>
        <li style={s.li}><strong>بيانات التقديم الوظيفي:</strong> 12 شهراً من تاريخ التقديم ما لم يُطلب حذفها مبكراً</li>
        <li style={s.li}><strong>سجلات الاستخدام:</strong> 90 يوماً</li>
      </ul>

      <h2 style={s.h2}>6. حقوقك وفق النظام السعودي (PDPL)</h2>
      <p style={s.p}>يكفل لك النظام الحقوق التالية التي يمكنك ممارستها في أي وقت:</p>
      <ul style={s.ul}>
        <li style={s.li}><strong>الاطلاع:</strong> معرفة ما نحتفظ به من بياناتك</li>
        <li style={s.li}><strong>التصحيح:</strong> طلب تصحيح البيانات غير الدقيقة</li>
        <li style={s.li}><strong>الحذف:</strong> طلب حذف بياناتك (حق النسيان)</li>
        <li style={s.li}><strong>الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض التسويق</li>
        <li style={s.li}><strong>سحب الموافقة:</strong> في أي وقت دون التأثير على شرعية المعالجة السابقة</li>
      </ul>
      <p style={s.p}>للتواصل بشأن حقوقك: <strong>privacy@saudicareers.site</strong></p>

      <h2 style={s.h2}>7. أمان البيانات</h2>
      <p style={s.p}>
        نُطبّق تدابير أمنية تقنية وتنظيمية مناسبة تشمل: تشفير الاتصالات (TLS)، التحكم في وصول الموظفين، وإجراءات الاستجابة للحوادث. في حال وقوع أي اختراق يؤثر على بياناتك، نلتزم بإخطارك وإخطار الهيئة السعودية للبيانات والذكاء الاصطناعي خلال 72 ساعة وفق المادة (19) من النظام.
      </p>

      <h2 style={s.h2}>8. ملفات الارتباط (Cookies)</h2>
      <p style={s.p}>
        نستخدم ملفات ارتباط ضرورية لتشغيل المنصة وحفظ جلسة تسجيل الدخول فقط. لا نستخدم ملفات ارتباط تتبعية أو تسويقية من أطراف ثالثة.
      </p>

      <h2 style={s.h2}>9. التحديثات على هذه السياسة</h2>
      <p style={s.p}>
        قد نُحدّث هذه السياسة دورياً لمواكبة التغييرات التشريعية أو التحديثات في خدماتنا. سنُخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني المسجّل أو عبر إشعار بارز على المنصة.
      </p>

      <h2 style={s.h2}>10. التواصل والشكاوى</h2>
      <p style={s.p}>
        للتواصل مع مسؤول حماية البيانات: <strong>privacy@saudicareers.site</strong><br/>
        لتقديم شكوى رسمية: يمكنك التواصل مع الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) عبر الموقع الرسمي <strong>sdaia.gov.sa</strong>
      </p>

      <hr style={s.divider}/>
      <p style={{ ...s.p, fontSize: 13, color: 'var(--gray400)', textAlign: 'center' }}>
        © {new Date().getFullYear()} سعودي كارييرز · جميع الحقوق محفوظة ·{' '}
        <Link to="/terms" style={{ color: 'var(--g700)', textDecoration: 'none' }}>شروط الاستخدام</Link>
      </p>
    </div>
  )
}
