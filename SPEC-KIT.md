# SaudiCareers — Reverse-Engineering Spec-Kit
**تاريخ الاستخراج:** 2026-04-14  
**المصدر:** قراءة مباشرة من الكود — ليس توثيقاً يدوياً  
**الغرض:** مرجع ثابت لكل تحديث قادم

---

## 1. خريطة الملفات (File Map)

```
saudicareers/
│
├── src/                              ← React SPA (source)
│   ├── main.jsx                      ← Entry point: createRoot + ErrorBoundary
│   ├── App.jsx                       ← BrowserRouter + 4 Routes
│   ├── pages/
│   │   ├── Home.jsx                  ← الصفحة الرئيسية (jobs + tips + subscribe)
│   │   ├── Admin.jsx                 ← لوحة التحكم (3 tabs: jobs/apps/subscribers)
│   │   ├── JobDetail.jsx             ← تفاصيل وظيفة /jobs/:id
│   │   └── TipDetail.jsx             ← تفاصيل نصيحة /tips/:slug
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── JobCard.jsx               ← بطاقة عرض الوظيفة
│   │   ├── ApplyModal.jsx            ← نموذج التقديم (modal overlay)
│   │   ├── JobStructuredData.jsx     ← JSON-LD للـ SEO
│   │   └── ErrorBoundary.jsx         ← يعترض React crashes (class component)
│   ├── data/index.js                 ← FALLBACK_JOBS (12) + FALLBACK_TIPS (6) + CATEGORIES
│   ├── services/api.js               ← ApiService class + 5 named exports
│   └── styles/global.css             ← CSS variables + global styles
│
├── backend/                          ← Laravel 10 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── JobController.php
│   │   │   │   ├── ApplicationController.php
│   │   │   │   ├── CareerTipController.php
│   │   │   │   ├── SubscriberController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   └── BulkJobController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── EnsureUserIsAdmin.php   ← alias: 'admin'
│   │   │   │   └── SecurityHeaders.php     ← global middleware
│   │   │   ├── Requests/
│   │   │   │   ├── StoreJobRequest.php
│   │   │   │   ├── UpdateJobRequest.php
│   │   │   │   └── StoreApplicationRequest.php
│   │   │   └── Resources/
│   │   │       ├── JobResource.php
│   │   │       ├── JobCollection.php
│   │   │       ├── ApplicationResource.php
│   │   │       ├── CareerTipResource.php
│   │   │       ├── CareerTipCollection.php
│   │   │       └── SubscriberResource.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Job.php
│   │   │   ├── JobApplication.php
│   │   │   ├── CareerTip.php
│   │   │   └── Subscriber.php
│   │   └── Providers/
│   │       ├── AppServiceProvider.php
│   │       └── RouteServiceProvider.php
│   ├── database/
│   │   ├── migrations/               ← 6 ملفات (ترتيب ثابت)
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── AdminUserSeeder.php
│   └── routes/api.php
│
├── public/                           ← Vite static input
├── dist/                             ← Vite build output (لا يُعدَّل يدوياً)
│
├── vite.config.js
├── package.json
├── index.html                        ← على السيرفر: نسخة من dist/index.html
├── assets/                           ← على السيرفر: نسخة من dist/assets/
├── nginx-cloudways-vhost.conf        ← إعداد Nginx الجاهز للـ paste
├── deploy.sh                         ← سكريبت النشر الكامل
└── backend/jobs-import-template.csv  ← قالب استيراد CSV
```

---

## 2. Routing Map

### 2.1 Frontend Routes (React Router v6)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home` | الصفحة الرئيسية |
| `/jobs/:id` | `JobDetail` | id = رقم من DB |
| `/tips/:slug` | `TipDetail` | slug = نص فريد |
| `/admin` | `Admin` | لا حماية route-level — الحماية في الـ state |

**SPA Requirement:** Nginx يجب يُعيد `index.html` لكل path غير موجود:
```nginx
location / { try_files $uri $uri/ /index.html; }
```

### 2.2 Backend API Routes (api.php)

#### Public — لا يحتاج token

| Method | Endpoint | Controller@Method | Notes |
|--------|----------|-------------------|-------|
| GET | `/api/v1/jobs` | `JobController@index` | Filters: category, featured, search, per_page |
| GET | `/api/v1/jobs/{job}` | `JobController@show` | Route Model Binding by id |
| GET | `/api/v1/tips` | `CareerTipController@index` | Filter: category |
| GET | `/api/v1/tips/{tip}` | `CareerTipController@show` | Route Model Binding by **slug** |
| POST | `/api/v1/applications` | `ApplicationController@store` | يقبل CV file |
| POST | `/api/v1/subscribe` | `SubscriberController@store` | |
| POST | `/api/v1/login` | `AuthController@login` | throttle: 5 req/min |

#### Protected — يحتاج `Authorization: Bearer {token}`

| Method | Endpoint | Controller@Method |
|--------|----------|-------------------|
| POST | `/api/logout` | `AuthController@logout` |
| GET | `/api/user` | `AuthController@user` |
| POST | `/api/refresh-token` | `AuthController@refreshToken` |

#### Admin — يحتاج Bearer token + `role = 'admin'`

| Method | Endpoint | Controller@Method |
|--------|----------|-------------------|
| POST | `/api/admin/jobs` | `JobController@store` |
| PUT/PATCH | `/api/admin/jobs/{job}` | `JobController@update` |
| DELETE | `/api/admin/jobs/{job}` | `JobController@destroy` |
| POST | `/api/admin/jobs/bulk` | `BulkJobController@store` |
| GET | `/api/admin/applications` | `ApplicationController@index` |
| PATCH | `/api/admin/applications/{application}/status` | `ApplicationController@updateStatus` |
| GET | `/api/admin/subscribers` | `SubscriberController@index` |
| POST | `/api/admin/register` | `AuthController@register` |

---

## 3. Database Schema (من الـ migrations الفعلية)

### جدول: `users`
```
id               BIGINT PK AUTO_INCREMENT
name             VARCHAR(255)
email            VARCHAR(255) UNIQUE
email_verified_at TIMESTAMP NULL
password         VARCHAR(255)
role             VARCHAR(255) DEFAULT 'admin'
remember_token   VARCHAR(100) NULL
created_at       TIMESTAMP
updated_at       TIMESTAMP
```
> ملاحظة: التحقق من الـ admin يتم عبر `role = 'admin'`، وليس حقل boolean.
> الدالة في الـ Model: `isAdmin(): bool { return $this->role === 'admin'; }`

### جدول: `jobs`
```
id               BIGINT PK AUTO_INCREMENT
title            VARCHAR(255)
title_en         VARCHAR(255) NULL
company          VARCHAR(255)
company_logo     VARCHAR(255) NULL
location         VARCHAR(255)
salary_min       INT NULL
salary_max       INT NULL
description      TEXT
requirements     TEXT NULL
category         ENUM('tech','finance','energy','construction','hr','marketing','healthcare','education','other')
job_type         ENUM('full_time','part_time','contract','internship','remote')
experience_level ENUM('entry','mid','senior','lead','executive')
is_active        TINYINT(1) DEFAULT 1
is_featured      TINYINT(1) DEFAULT 0
apply_url        VARCHAR(255) NULL
posted_at        TIMESTAMP NULL
created_at       TIMESTAMP
updated_at       TIMESTAMP

INDEX: category, is_active, is_featured
```

### جدول: `job_applications`
```
id               BIGINT PK AUTO_INCREMENT
job_id           BIGINT FK → jobs(id) CASCADE DELETE
name             VARCHAR(255)
email            VARCHAR(255)
phone            VARCHAR(255) NULL
cv_path          VARCHAR(255) NULL        ← storage/cvs/filename.pdf
cover_letter     TEXT NULL
linkedin_url     VARCHAR(255) NULL
portfolio_url    VARCHAR(255) NULL
status           ENUM('pending','reviewed','interview','rejected','accepted') DEFAULT 'pending'
notes            TEXT NULL
applied_at       TIMESTAMP NULL
created_at       TIMESTAMP
updated_at       TIMESTAMP

INDEX: status, email
```

### جدول: `career_tips`
```
id               BIGINT PK AUTO_INCREMENT
title            VARCHAR(255)
title_en         VARCHAR(255) NULL
slug             VARCHAR(255) UNIQUE      ← مفتاح الـ route
excerpt          TEXT
content          LONGTEXT
category         ENUM('cv','interview','linkedin','career','salary','skills')
image            VARCHAR(255) NULL
author           VARCHAR(255) NULL
is_published     TINYINT(1) DEFAULT 1
published_at     TIMESTAMP NULL
created_at       TIMESTAMP
updated_at       TIMESTAMP

INDEX: slug, category, is_published
```
> ملاحظة: `getRouteKeyName()` يُعيد `'slug'` — Route Model Binding يبحث بـ slug لا بـ id.

### جدول: `subscribers`
```
id               BIGINT PK AUTO_INCREMENT
name             VARCHAR(255) NULL
email            VARCHAR(255) UNIQUE
phone            VARCHAR(255) NULL
field            VARCHAR(255) NULL        ← أُضيف في migration رقم 5
cv_path          VARCHAR(255) NULL
is_active        TINYINT(1) DEFAULT 1
subscribed_at    TIMESTAMP NULL
created_at       TIMESTAMP
updated_at       TIMESTAMP

INDEX: email, is_active
```

### جداول Sanctum (تلقائية)
```
personal_access_tokens:
  id, tokenable_type, tokenable_id (morphs)
  name, token (hashed SHA256, unique)
  abilities (JSON NULL)
  last_used_at, expires_at
  created_at, updated_at
```

---

## 4. Data Contracts (JSON Shapes)

### 4.1 GET /api/v1/jobs — Response

```json
{
  "data": [
    {
      "id": 1,
      "title": "مطور Full Stack",
      "title_en": "Full Stack Developer",
      "company": "STC",
      "company_logo": null,
      "location": "الرياض",
      "salary_min": 18000,
      "salary_max": 28000,
      "salary": "18,000 - 28,000 ر.س",
      "description": "...",
      "requirements": "...",
      "category": "tech",
      "category_label": "تقنية",
      "job_type": "full_time",
      "job_type_label": "دوام كامل",
      "experience_level": "mid",
      "is_featured": true,
      "apply_url": null,
      "posted_at": "منذ 3 أيام",
      "created_at": "2024-01-15T10:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 12,
    "total": 30
  },
  "links": {
    "first": "https://saudicareers.site/api/v1/jobs?page=1",
    "last": "...",
    "prev": null,
    "next": "https://saudicareers.site/api/v1/jobs?page=2"
  }
}
```

**Query Parameters المدعومة:**
- `?category=tech` — فلتر بالتصنيف (أو `all` لإلغاء الفلتر)
- `?featured=1` — الوظائف المميزة فقط
- `?search=مطور` — بحث في title, company, location
- `?per_page=12` — عدد النتائج (افتراضي: 12)
- `?page=2` — رقم الصفحة

### 4.2 POST /api/v1/login — Request & Response

```json
// Request
{
  "email": "admin@saudicareers.site",
  "password": "SecureP@ssword123",
  "device_name": "admin"
}

// Response 200
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@saudicareers.site",
    "role": "admin"
  },
  "token": "1|abc123xyz..."
}

// Response 422 (بيانات خاطئة)
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["البيانات غير صحيحة"]
  }
}
```

### 4.3 POST /api/v1/applications — Request (multipart/form-data)

```
job_id          integer (required, must exist in jobs table)
name            string (required, max:255)
email           string (required, valid email, max:255)
phone           string (optional, max:20)
cv              file   (optional, PDF/DOC/DOCX, max:5MB)
cover_letter    string (optional, max:2000)
linkedin_url    url    (optional)
portfolio_url   url    (optional)
```

### 4.4 POST /api/admin/jobs — Request (JSON)

```json
{
  "title": "مطور Backend",
  "title_en": "Backend Developer",
  "company": "شركة X",
  "company_logo": null,
  "location": "الرياض",
  "salary_min": 15000,
  "salary_max": 22000,
  "description": "وصف الوظيفة...",
  "requirements": "المتطلبات...",
  "category": "tech",
  "job_type": "full_time",
  "experience_level": "mid",
  "is_active": true,
  "is_featured": false,
  "apply_url": null,
  "posted_at": null
}
```

**Validation — salary_max:** `gte:salary_min` (يجب أن يكون أكبر أو يساوي salary_min)

### 4.5 POST /api/admin/jobs/bulk — CSV Format

```csv
title,title_en,company,location,description,requirements,category,job_type,experience_level,salary_min,salary_max,apply_url,is_featured,is_active
مطور Full Stack,Full Stack Developer,STC,الرياض,الوصف...,المتطلبات...,tech,full_time,mid,18000,28000,,true,true
```

**Response:**
```json
{
  "message": "تم الاستيراد: 3 ناجحة، 1 فاشلة",
  "summary": { "total": 4, "created": 3, "failed": 1 },
  "created": [{"id": 5, "title": "مطور Full Stack"}],
  "errors": [{"row": 2, "title": "...", "errors": {"category": ["..."]}}]
}
```
> الحد الأقصى: 500 صف لكل طلب. الملف: CSV أو TXT، max 2MB.

---

## 5. Enum Values — المرجع الكامل

| Field | Values |
|-------|--------|
| `jobs.category` | `tech` `finance` `energy` `construction` `hr` `marketing` `healthcare` `education` `other` |
| `jobs.job_type` | `full_time` `part_time` `contract` `internship` `remote` |
| `jobs.experience_level` | `entry` `mid` `senior` `lead` `executive` |
| `job_applications.status` | `pending` `reviewed` `interview` `rejected` `accepted` |
| `career_tips.category` | `cv` `interview` `linkedin` `career` `salary` `skills` |
| `users.role` | `admin` (القيمة الوحيدة المستخدمة حالياً) |

**Arabic Labels (من JobResource.php):**

| key | label |
|-----|-------|
| tech | تقنية |
| finance | مالية |
| energy | طاقة |
| construction | إنشاءات |
| hr | موارد بشرية |
| marketing | تسويق |
| healthcare | صحة |
| education | تعليم |
| other | أخرى |
| full_time | دوام كامل |
| part_time | دوام جزئي |
| contract | عقد |
| internship | تدريب |
| remote | عن بعد |

---

## 6. Frontend State Architecture

### 6.1 api.js — Service Layer

```
ApiService (class)
  ├── request(endpoint, options)   ← النواة: fetch + token injection + error handling
  ├── get(endpoint, params)        ← يبني query string تلقائياً
  ├── post(endpoint, data)
  ├── put(endpoint, data)
  ├── patch(endpoint, data)
  └── delete(endpoint)

Named exports (من api.js):
  ├── api              ← instance من ApiService (للاستخدام المباشر)
  ├── authApi          ← { login, logout, getUser, isAuthenticated }
  ├── jobsApi          ← { getAll, getFeatured, getById, create, update, delete }
  ├── applicationsApi  ← { submit, getAll, updateStatus }
  ├── tipsApi          ← { getAll, getBySlug }
  └── subscribersApi   ← { subscribe, getAll }
```

**Token storage:** `localStorage.getItem('auth_token')` — المفتاح: `auth_token`  
**User storage:** `localStorage.getItem('user')` — JSON string  
**401 handling:** يحذف الـ token تلقائياً ويعيد توجيه المستخدم إلى `/admin`

### 6.2 Admin.jsx — State Variables

```javascript
loading         boolean   ← spinner أثناء تحميل أولي
authError       string    ← رسالة خطأ login
email/password  string    ← حقول نموذج الـ login
user            object    ← { id, name, email, role } من localStorage
jobs            array     ← قائمة الوظائف (max 100)
editing         number|null ← id الوظيفة المُعدَّلة
showForm        boolean   ← ظهور modal الإضافة/التعديل
saving          boolean   ← spinner زر الحفظ
deleting        number|null ← id الوظيفة المحذوفة
activeTab       string    ← 'jobs' | 'applications' | 'subscribers'
applications    array     ← قائمة التقديمات (max 100 per_page)
loadingApps     boolean
subscribers     array     ← قائمة المشتركين (paginated 50)
loadingSubs     boolean
subsCopied      boolean   ← حالة زر "نسخ الإيميلات" (2 ثانية)
form            object    ← بيانات نموذج الوظيفة
```

**form default (empty state):**
```javascript
{
  title:'', title_en:'', company:'', location:'',
  salary_min:'', salary_max:'', description:'',
  requirements:'', category:'tech', job_type:'full_time',
  experience_level:'mid', is_featured:false, is_active:true
}
```

### 6.3 Home.jsx — Data Flow

```
FALLBACK_JOBS (12 وظيفة ثابتة)
       ↓ useState initial value
jobs state ← يُعرض فوراً للمستخدم (0ms)
       ↓ useEffect (بعد mount)
jobsApi.getAll() → إذا نجح → setJobs(data.jobs)
                 → إذا فشل → الـ fallback يظل
```

**normalizeJob():** تحويل Job API response → شكل JobCard المتوقع  
**normalizeTip():** تحويل CareerTip API response → شكل TipCard المتوقع  
**useReveal():** IntersectionObserver hook — fade-in + slide-up عند الظهور في الـ viewport

---

## 7. Middleware Stack

### 7.1 Global (كل طلب)
```
1. SecurityHeaders        ← X-Content-Type-Options, X-Frame-Options, HSTS, etc.
2. HandleCors             ← من .env: CORS_ALLOWED_ORIGINS
3. ValidatePostSize       ← حماية من payloads كبيرة
4. ConvertEmptyStringsToNull ← تحويل "" → null تلقائياً
```

### 7.2 API Group
```
throttle:api             ← rate limiting عام
SubstituteBindings       ← Route Model Binding
```

### 7.3 Protected Routes
```
auth:sanctum             ← التحقق من Bearer token
admin                    ← التحقق من role = 'admin'  (EnsureUserIsAdmin.php)
```

### 7.4 Security Headers المُرسَلة
```
X-Content-Type-Options:  nosniff
X-Frame-Options:         SAMEORIGIN
X-XSS-Protection:        1; mode=block
Referrer-Policy:         strict-origin-when-cross-origin
Permissions-Policy:      camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains  (HTTPS فقط)
```

---

## 8. Build & Deploy Specs

### 8.1 Vite Config (vite.config.js)

```javascript
base: '/'                          // CRITICAL — لا تغيّره إلى './'
outDir: 'dist'
assetsDir: 'assets'
sourcemap: false
manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] }
```

**Output files:**
```
dist/
├── index.html
└── assets/
    ├── index-[hash].js    ← app bundle
    ├── vendor-[hash].js   ← react + router
    └── index-[hash].css
```

### 8.2 Atomic Deploy Command
```bash
cd ~/applications/gaczagbrjk/public_html && \
git pull origin main && \
npm ci --prefer-offline && \
npm run build && \
cp dist/index.html index.html && \
rm -rf assets && \
cp -r dist/assets assets
```
> يجب نشر `index.html` و `assets/` من نفس الـ build. Hash mismatch = شاشة بيضاء.

### 8.3 Nginx Vhost (nginx-cloudways-vhost.conf)

```nginx
# ترتيب الـ blocks مهم جداً:

# 1. Static files — يخدم مباشرة (يجب أن يأتي قبل location /)
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|webmanifest|xml|txt)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# 2. Laravel API
location /api {
    alias /home/1600726.cloudwaysapps.com/gaczagbrjk/public_html/backend/public;
    try_files $uri $uri/ @laravel;
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include fastcgi_params;
    }
}

location @laravel {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME /home/.../backend/public/index.php;
    include fastcgi_params;
}

# 3. Laravel Storage
location /storage {
    alias /home/.../backend/public/storage;
    try_files $uri $uri/ =404;
}

# 4. React SPA (آخر شيء)
location / {
    try_files $uri $uri/ /index.html;
}
```

### 8.4 Environment Variables (.env)

```env
# Backend (backend/.env)
APP_NAME=SaudiCareers
APP_ENV=production
APP_DEBUG=false
APP_URL=https://saudicareers.site

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

CORS_ALLOWED_ORIGINS=https://saudicareers.site,https://www.saudicareers.site

# Frontend (.env / .env.local)
VITE_API_URL=https://saudicareers.site/api
VITE_API_TARGET=http://localhost:8000    ← للـ dev proxy فقط
```

---

## 9. Validation Rules — الجداول المرجعية

### StoreJobRequest.php
| Field | Rule |
|-------|------|
| title | required, string, max:255 |
| title_en | nullable, string, max:255 |
| company | required, string, max:255 |
| company_logo | nullable, string, max:500 |
| location | required, string, max:255 |
| salary_min | nullable, integer, min:0 |
| salary_max | nullable, integer, min:0, **gte:salary_min** |
| description | required, string |
| requirements | nullable, string |
| category | required, in: [9 values] |
| job_type | required, in: [5 values] |
| experience_level | required, in: [5 values] |
| is_active | boolean |
| is_featured | boolean |
| apply_url | nullable, url |
| posted_at | nullable, date |

### StoreApplicationRequest.php
| Field | Rule |
|-------|------|
| job_id | required, **exists:jobs,id** |
| name | required, string, max:255 |
| email | required, email, max:255 |
| phone | nullable, string, max:20 |
| cv | nullable, **file**, mimes:pdf,doc,docx, **max:5120** (5MB) |
| cover_letter | nullable, string, max:2000 |
| linkedin_url | nullable, url |
| portfolio_url | nullable, url |

### AuthController — register (admin-only)
| Field | Rule |
|-------|------|
| name | required, string, max:255 |
| email | required, email, unique:users,email |
| password | required, min:12, confirmed, **regex: uppercase + lowercase + digit + special char** |

---

## 10. Model Scopes (Query Shortcuts)

### Job.php
```php
Job::active()              → where('is_active', true)
Job::featured()            → where('is_featured', true)
Job::byCategory($cat)      → where('category', $cat)
Job::active()->latest()    ← الاستخدام الشائع في JobController@index
```

### CareerTip.php
```php
CareerTip::published()     → where('is_published', true)
// Route Model Binding يستخدم slug لا id
CareerTip::getRouteKeyName() → 'slug'
```

### JobApplication.php
```php
JobApplication::pending()  → where('status', 'pending')
JobApplication::reviewed() → where('status', 'reviewed')
// Accessor: $application->status_label → Arabic label
```

---

## 11. Known Constraints & Gotchas

| # | الموضوع | التفاصيل |
|---|---------|----------|
| 1 | **Hash Mismatch** | كل `npm run build` يُغيّر أسماء الـ JS/CSS. يجب نشر `index.html` + `assets/` معاً من نفس الـ build وإلا → 404 على الـ JS → شاشة بيضاء |
| 2 | **Nginx MIME** | بدون `location ~* \.js$` block، Nginx يُحوّل الـ JS إلى PHP-FPM → `Content-Type: text/html` → browser يرفض تنفيذه كـ module |
| 3 | **base: '/'** | `base: './'` يكسر `/admin` و أي route غير `/` لأن asset paths تصبح relative |
| 4 | **Bulk Insert timestamps** | `Job::insert([...])` يتجاوز Eloquent → `updated_at` تظل NULL → DB error إذا العمود NOT NULL. الحل: أضف `'updated_at' => now()` يدوياً |
| 5 | **CareerTip slug routing** | `getRouteKeyName()` يُعيد `slug` — Route Model Binding يبحث بـ slug. أي تعديل على الـ slug يكسر الـ URLs القديمة |
| 6 | **CV Storage** | الـ CVs تُحفظ في `storage/cvs/` عبر `store('cvs', 'public')`. يجب تشغيل `php artisan storage:link` عند أول deploy |
| 7 | **Admin auth في React** | لا يوجد route guard — الحماية عبر state فقط. المستخدم يرى صفحة login إذا `!authApi.isAuthenticated()`. Hard refresh على `/admin` بدون token → login page |
| 8 | **subscribers.field** | أُضيف في migration منفصلة (#5). إذا نفّذت migrations على قاعدة قديمة بدون هذا العمود ستحصل على SQL error في SubscriberController |
| 9 | **CORS** | مُقيّد بـ `CORS_ALLOWED_ORIGINS` من الـ `.env`. في الـ dev يجب إضافة `http://localhost:5173` أو استخدام الـ Vite proxy |
| 10 | **vendor chunk** | React + ReactDOM + React Router مجمّعون في `vendor-[hash].js` منفصل. هذا يُسرّع الـ cache — الـ vendor لا يتغير hash إلا إذا تغيّرت الـ dependencies |

---

## 12. API Base URL Configuration

```javascript
// src/services/api.js — السطر الأول
const API_BASE = import.meta.env.VITE_API_URL || 'https://saudicareers.site/api';
```

| البيئة | القيمة |
|--------|--------|
| Production | `https://saudicareers.site/api` (hardcoded fallback) |
| Dev (Vite proxy) | `/api` يُحوَّل إلى `http://localhost:8000` |
| Custom | `.env`: `VITE_API_URL=https://...` |

**جميع الـ API calls تضيف `/v1/` يدوياً في الـ service functions:**
```javascript
jobsApi.getAll()  →  GET  /api/v1/jobs
authApi.login()   →  POST /api/v1/login
jobsApi.create()  →  POST /api/admin/jobs   ← بدون /v1/ (admin routes خارجها)
```

---

## 13. Cloudways Server Paths

```
Webroot:    /home/1600726.cloudwaysapps.com/gaczagbrjk/public_html/
Backend:    /home/1600726.cloudwaysapps.com/gaczagbrjk/public_html/backend/
Laravel:    /home/1600726.cloudwaysapps.com/gaczagbrjk/public_html/backend/public/
Storage:    /home/1600726.cloudwaysapps.com/gaczagbrjk/public_html/backend/public/storage/
App ID:     gaczagbrjk
PHP:        8.2-FPM (sock: /var/run/php/php8.2-fpm.sock)
```

---

*آخر تحديث: 2026-04-14 — مُستخرَج من الكود مباشرة*
