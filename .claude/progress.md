# حالة تغطية الاختبارات — المسارات الأربعة النشطة
# آخر تحديث: 2026-04-14
# التصنيف: @active = موجود في الكود | @planned = مستقبلي في .claude/future/

---

## 🏁 نسخة v1.0-RC1 — معايير الأداء المعتمدة

| المؤشر | القيمة | الحد الأقصى المسموح |
|---|---|---|
| `vendor` chunk (react/router) | **162 KB** (gzip: 52.9 KB) | 178 KB (+10%) |
| `main` chunk (index) | **28 KB** (gzip: 10.3 KB) | 31 KB (+10%) |
| `icons` chunk (lucide-react) | **13.2 KB** (gzip: 2.9 KB) | 20 KB |
| LCP هدف | **< 1.8s** | 1.8s |

**أي commit يرفع Initial Payload > 10% دون مبرر استراتيجي = يستوجب مراجعة.**

### معيار الصور في الـ Header (ثابت)
```jsx
// ✅ النمط المعتمد — Navbar (LCP critical path)
<picture>
  <source srcSet="/logo.webp" type="image/webp" />
  <img src="/logo.png" fetchPriority="high" decoding="async" ... />
</picture>

// ✅ النمط المعتمد — Footer / داخل الصفحة
<picture>
  <source srcSet="/logo.webp" type="image/webp" />
  <img src="/logo.png" loading="lazy" ... />
</picture>
```
- الـ WebP مع PNG fallback إلزامي لكل صورة علامة تجارية
- `fetchPriority="high"` للصور فوق الطي (above-the-fold) فقط
- `loading="lazy"` لكل صورة تحت الطي

### معيار Lazy Loading (ثابت)
```jsx
// ✅ كل route جديد يدخل بـ React.lazy()
const NewModule = lazy(() => import('./pages/NewModule.jsx'))
```
- لا يُضاف موديول جديد للـ main bundle مباشرة
- ينطبق على: Probation Tracker، Job Moderation، وأي صفحة مستقبلية

### معيار توثيق نظام العمل السعودي
```jsx
// ✅ مثال — عند استخدام مدة فترة التجربة
// نظام العمل السعودي — المادة 53: فترة التجربة لا تتجاوز 90 يوماً
const PROBATION_MAX_DAYS = 90
```
- أي قيمة مستمدة من نظام العمل تُعلَّق برقم المادة المقابلة

---

## المسار 1 — ATS Resume Analyzer

| الملف | الحالة |
|---|---|
| `spec-kit/current/resume-analyzer.feature` | ✅ مكتمل |
| `src/pages/ResumeAnalyzer.jsx` | ✅ موجود |
| `src/pages/ResumeResults.jsx` | ✅ موجود |
| `backend/app/Http/Controllers/Api/ResumeController.php` | ✅ موجود |
| `POST /api/v1/resume/analyze` | ✅ مفعّل (throttle: 3/min) |

**سيناريوهات:**
- [x] الصفحة تُحمّل صحيحاً
- [x] رفع PDF صالح → تحليل → انتقال لـ /resume-results/:id
- [x] صفحة النتائج تعرض 4 طبقات
- [x] رفع ملف غير PDF → مرفوض
- [x] PDF > 2MB → خطأ 422
- [x] 4 محاولات متتالية → خطأ 429
- [x] Refresh على نتائج محفوظة في localStorage
- [x] Refresh بـ ID غير موجود → إعادة توجيه
- [x] حجم bundle ضمن الحدود

---

## المسار 2 — Job Browsing & Application

| الملف | الحالة |
|---|---|
| `spec-kit/current/job-browsing.feature` | ✅ مكتمل |
| `src/pages/Home.jsx` | ✅ موجود |
| `src/components/ApplyModal.jsx` | ✅ موجود |
| `GET /api/v1/jobs` | ✅ مفعّل |
| `POST /api/v1/applications` | ✅ مفعّل |

**سيناريوهات:**
- [x] الصفحة الرئيسية تُحمّل الوظائف (API أو fallback)
- [x] فلترة الوظائف بالتصنيف
- [x] النقر على بطاقة وظيفة → /jobs/:id
- [x] زر "تقدم الآن" → ApplyModal + تقديم ناجح
- [x] Validation: حقول فارغة
- [x] Validation: رفع CV > 5MB
- [x] إغلاق الـ Modal

---

## المسار 3 — Newsletter Signup

| الملف | الحالة |
|---|---|
| `spec-kit/current/newsletter.feature` | ✅ مكتمل |
| `src/pages/Home.jsx` → SignupForm (line 116) | ✅ موجود |
| `src/pages/Home.jsx` → FooterSignupForm (line 587) | ✅ موجود |
| `POST /api/v1/subscribe` | ✅ مفعّل |

**سيناريوهات:**
- [x] نموذج signup يظهر في القسم الصحيح
- [x] تسجيل ناجح → رسالة شكر
- [x] بريد مسجل مسبقاً → يُعامل كنجاح
- [x] حقل الاسم فارغ → لا إرسال
- [x] بريد بدون "@" → لا إرسال
- [x] نموذج الـ Footer يعمل
- [x] حالة "جارٍ التسجيل..." أثناء الإرسال
- [x] CTA من ResumeResults → تنتقل لـ #signup

---

## المسار 4 — Admin Dashboard

| الملف | الحالة |
|---|---|
| `spec-kit/current/admin.feature` | ✅ مكتمل |
| `src/pages/Admin.jsx` | ✅ موجود |
| `POST /api/v1/login` | ✅ مفعّل |
| `GET/POST/PATCH/DELETE /admin/*` | ✅ مفعّل (Bearer token) |

**سيناريوهات:**
- [x] /admin بدون token → نموذج تسجيل الدخول
- [x] Hard refresh بدون token → نموذج تسجيل الدخول
- [x] بيانات خاطئة → رسالة خطأ
- [x] حقول فارغة → validation محلي
- [x] تسجيل دخول ناجح → Dashboard
- [x] قائمة الوظائف
- [x] إضافة وظيفة جديدة
- [x] Validation: حقول إلزامية فارغة
- [x] تعديل وظيفة
- [x] حذف وظيفة
- [x] تبويب الطلبات + تحديث الحالة
- [x] تبويب المشتركين + CSV + نسخ الإيميلات
- [x] تسجيل الخروج

---

## الميزات المستقبلية (@planned)

| الملف | الوصف |
|---|---|
| `.claude/future/job-moderation-policy.md` | نظام صاحب العمل V1→V3 |

**شرط النقل من @planned إلى @active:**
1. الكود موجود ومُختبر يدوياً
2. SPEC-KIT.md محدّث بـ API contract
3. verification-agent يُشغّل السيناريو ويجتازه

---

## إجمالي التغطية

```
المسارات النشطة:   4 / 4   ✅
ملفات .feature:    4       ✅
سيناريوهات @active: 37
سيناريوهات @planned: 12 (في future/)
```
