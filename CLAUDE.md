# SaudiCareers — Claude Code Instructions

## المرجع الأساسي
**اقرأ `SPEC-KIT.md` أولاً** قبل أي تعديل. هو المصدر الوحيد للحقيقة حول الـ routes, contracts, schemas, و gotchas.

---

## هيكل المشروع
- `src/` — React 18 + Vite SPA
- `backend/` — Laravel 10 API
- `dist/` — ناتج البناء (لا تعدّله يدوياً)
- `.claude/agents/` — وكلاء متخصصون

---

## قواعد التطوير

### Frontend
- استخدم **inline styles** حصراً — لا Tailwind classes (الكود الموجود inline styles)
- الـ CSS variables موجودة في `src/styles/global.css` — استخدمها (`var(--g900)`, `var(--gold500)`, إلخ)
- الـ Reveal/FadeIn animation: استخدم `useFadeIn` hook من `src/hooks/useFadeIn.js`
- الـ AnimatedNumber: استخدم `src/components/AnimatedNumber.jsx`
- لا تضف Tailwind classes لملفات موجودة

### Backend
- لا تغيّر الـ API contracts الموجودة في §4 من SPEC-KIT.md
- كل route جديد عام يدخل في `Route::prefix('v1')` في `api.php`
- بعد أي تعديل على routes: `php artisan route:clear && php artisan route:cache`

### Git
- كوّم الـ frontend والـ backend معاً في نفس الـ commit
- لا ترفع `.env` أو `dist/` أو `node_modules/` أو `vendor/`

---

## التحقق من الواجهة (UI Verification)

**لديك Playwright MCP متصل** — استخدمه بعد إنجاز أي ميزة:

```
استخدم verification-agent لاختبار الواجهة
```

### متى تستخدم وكيل التحقق؟
- بعد إنجاز أي صفحة أو مكوّن جديد
- بعد تعديل أي user flow (تسجيل، تقديم، تحليل سيرة)
- عند ظهور تقرير خطأ من المستخدم
- قبل كل deploy للإنتاج

### الـ Base URLs
```
محلي:   http://localhost:5173
إنتاج:  https://saudicareers.site
```

### السيناريوهات المغطاة في `verification-agent.md`
1. تنقل الـ Navbar من جميع الصفحات
2. أداة ATS Analyzer (upload → results page)
3. نموذج الاشتراك
4. قائمة الوظائف والفلاتر
5. Admin login

---

## النشر الذري

```bash
# على السيرفر (Cloudways):
cd ~/applications/gaczagbrjk/public_html
git pull origin main
cd backend && composer install --no-dev --optimize-autoloader
php artisan route:clear && php artisan route:cache && php artisan config:cache
cd .. && npm ci --prefer-offline && npm run build
cp dist/index.html index.html && rm -rf assets && cp -r dist/assets assets/
```

---

## أخطاء شائعة (راجع §11 من SPEC-KIT.md)

| الخطأ | السبب | الحل |
|-------|-------|------|
| شاشة بيضاء بعد deploy | Hash mismatch | انشر `index.html` + `assets/` معاً من نفس build |
| 404 على `/admin` بعد refresh | Nginx try_files مفقود | تحقق من `nginx-cloudways-vhost.conf` |
| "route could not be found" | ملفات غير مُكوّمة أو route cache قديم | `git status` + `route:cache` |
| PDF تحليل يفشل بـ 500 | memory_limit منخفض | `ini_set('memory_limit','256M')` في ResumeController |
