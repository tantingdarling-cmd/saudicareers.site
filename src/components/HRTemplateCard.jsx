import { useState } from 'react'
import { CheckCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * HRTemplateCard — Notion-style checklist card
 * Props:
 *   title        : string
 *   icon         : string (emoji)
 *   description  : string
 *   tips         : string[]
 *   redFlags     : string[]
 *   checklist    : string[]
 *   accentColor  : string (CSS color, default var(--g700))
 */
export default function HRTemplateCard({
  title,
  icon = '📋',
  description,
  tips = [],
  redFlags = [],
  checklist = [],
  accentColor = 'var(--g700)',
}) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked]   = useState({})

  const toggle = key => setChecked(p => ({ ...p, [key]: !p[key] }))

  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--gray200)',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      fontFamily: 'var(--font-ar)',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{
        padding: '20px 22px',
        borderBottom: expanded ? '1px solid var(--gray100)' : 'none',
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', userSelect: 'none',
      }}
      onClick={() => setExpanded(p => !p)}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--r-md)',
          background: 'var(--gray50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 3 }}>{title}</div>
          {description && <div style={{ fontSize: 13, color: 'var(--gray400)', lineHeight: 1.5 }}>{description}</div>}
        </div>
        <div style={{ color: 'var(--gray300)', flexShrink: 0 }}>
          {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 22px 22px' }}>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--gray400)', textTransform: 'uppercase', marginBottom: 10 }}>
                قائمة التحقق
              </div>
              {checklist.map((item, i) => (
                <label key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 10px', borderRadius: 'var(--r-sm)',
                  cursor: 'pointer', marginBottom: 4,
                  background: checked[i] ? 'var(--g50)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={!!checked[i]}
                    onChange={() => toggle(i)}
                    style={{ marginTop: 2, accentColor, flexShrink: 0 }}
                  />
                  <span style={{
                    fontSize: 13, color: checked[i] ? 'var(--gray400)' : 'var(--gray700)',
                    textDecoration: checked[i] ? 'line-through' : 'none',
                    lineHeight: 1.6, transition: 'all 0.2s',
                  }}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--gray400)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lightbulb size={12} color="var(--gold600)"/> نصائح
              </div>
              {tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '7px 10px', marginBottom: 4,
                  background: 'var(--gold100)', borderRadius: 'var(--r-sm)',
                  borderRight: '3px solid var(--gold500)',
                }}>
                  <CheckCircle size={14} color="var(--gold600)" style={{ marginTop: 2, flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: 'var(--gold700)', lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--gray400)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} color="#DC2626"/> تحذيرات شائعة
              </div>
              {redFlags.map((flag, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '7px 10px', marginBottom: 4,
                  background: 'rgba(220,38,38,0.05)', borderRadius: 'var(--r-sm)',
                  borderRight: '3px solid rgba(220,38,38,0.4)',
                }}>
                  <AlertTriangle size={14} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.6 }}>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── البيانات الجاهزة (3 قوالب HR) ─────────────────────────────── */
export const HR_TEMPLATES = [
  {
    id: 'interview-prep',
    title: 'التحضير للمقابلة الوظيفية',
    icon: '🎯',
    description: 'قائمة تحقق شاملة قبل وأثناء وبعد المقابلة',
    checklist: [
      'بحثت عن الشركة ومنتجاتها وقيمها',
      'راجعت متطلبات الوظيفة وربطتها بخبراتي',
      'حضّرت إجابات STAR لأسئلة الموقف',
      'حضّرت 3 أسئلة لأسألها المحاور',
      'جهّزت ملابس مناسبة ليوم المقابلة',
      'اختبرت الاتصال والكاميرا إن كانت عن بعد',
      'وصلت/اتصلت قبل الموعد بـ 5 دقائق',
    ],
    tips: [
      'استخدم صيغة STAR: الموقف، المهمة، الإجراء، النتيجة',
      'اذكر أرقاماً وإنجازات قابلة للقياس',
      'أنهِ المقابلة بسؤال عن الخطوات التالية',
    ],
    redFlags: [
      'انتقاد صاحب العمل السابق أمام المحاور',
      'الإجابة بـ "لا أعرف" دون محاولة التفكير',
      'التأخر دون إشعار مسبق',
    ],
  },
  {
    id: 'cv-audit',
    title: 'مراجعة السيرة الذاتية ذاتياً',
    icon: '📄',
    description: 'تحقق من جاهزية سيرتك لأنظمة ATS والمراجعين البشريين',
    checklist: [
      'معلومات التواصل كاملة (اسم، بريد، هاتف، لينكدإن)',
      'عنوان ATS قياسي في كل قسم (خبرات، تعليم، مهارات)',
      'الإنجازات مذكورة بأرقام وليس مجرد مهام',
      'لا أخطاء إملائية أو نحوية',
      'الملف بصيغة PDF مع اسم واضح',
      'لا صورة شخصية في السيرة (المعيار الدولي)',
      'الفجوات الزمنية موضّحة إن وُجدت',
      'الكلمات المفتاحية متوافقة مع الوظيفة المستهدفة',
    ],
    tips: [
      'خصّص سيرتك لكل وظيفة باستخدام كلمات من إعلانها',
      'الحد الأمثل: صفحة واحدة لأقل من 10 سنوات خبرة',
      'ابدأ كل إنجاز بفعل قوي: قاد، طوّر، أنجز، زاد',
    ],
    redFlags: [
      'استخدام صور أو جداول معقدة تربك ATS',
      'ذكر معلومات شخصية (العمر، الحالة الاجتماعية)',
      'إرسال نفس السيرة لجميع الوظائف',
    ],
  },
  {
    id: 'salary-negotiation',
    title: 'التفاوض على الراتب',
    icon: '💰',
    description: 'أدوات واستراتيجيات للحصول على عرض أفضل في السوق السعودي',
    checklist: [
      'بحثت عن متوسط الراتب في نفس الدور والقطاع',
      'حددت نطاقاً مقبولاً (أدنى وأعلى)',
      'حضّرت قائمة إنجازاتي التي تبرر الراتب المطلوب',
      'فهمت حزمة المزايا كاملاً (تأمين، إجازات، بدلات)',
      'تدربت على قول الرقم بثقة دون اعتذار',
    ],
    tips: [
      'اذكر رقماً أعلى بـ 15-20٪ مما تقبل به فعلاً',
      'سؤال عن المزايا الإضافية لا يضرك — بل يُظهر احترافية',
      'العرض الأول ليس نهائياً — التفاوض متوقع ومحترم',
    ],
    redFlags: [
      'ذكر راتبك الحالي قبل أن يسأل صاحب العمل',
      'قبول أول عرض فوراً دون مناقشة',
      'التفاوض بعد قبول العرض رسمياً',
    ],
  },
]
