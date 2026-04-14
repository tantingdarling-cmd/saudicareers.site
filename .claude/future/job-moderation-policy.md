# سياسة إشراف صاحب العمل — خارطة طريق مستقبلية
# Status: @planned — لا يوجد كود حالي يدعم هذه الميزات
# Created: 2026-04-14
# Reference: SPEC-KIT.md (قسم مستقبلي)

---

## الوضع الحالي (ما هو موجود فعلاً)

```
✅ Admin يُنشئ وظائف مباشرة (POST /api/v1/jobs) — لا دور "صاحب عمل" منفصل
✅ Admin فقط يملك صلاحية إنشاء/تعديل/حذف الوظائف
✅ الزوار يتقدمون عبر ApplyModal (POST /api/v1/applications)
❌ لا يوجد تسجيل عام للمتقدمين
❌ لا يوجد دور "Employer" في قاعدة البيانات
❌ لا يوجد workflow موافقة/رفض للوظائف
```

---

## V1 — نموذج صاحب العمل المُدار (Managed Employer)

> **المفهوم:** صاحب العمل لا يسجّل بنفسه — Admin يُنشئ الحسابات وينشر نيابةً عنه

### @planned الميزات المطلوبة

```gherkin
@planned
Feature: Employer Account Management (Admin-Managed)

  Scenario: Admin creates employer profile
    Given I am logged in as admin
    When I navigate to the "أصحاب العمل" tab (NEW - does not exist yet)
    And I fill employer details: company name, logo URL, contact email
    And I click "إنشاء حساب"
    Then the employer record is saved in the database
    # Requires: employers table migration + EmployerController

  Scenario: Admin publishes job on behalf of employer
    Given an employer record exists
    When Admin creates a job and links it to the employer
    Then the job shows the employer's branding
    # Requires: jobs.employer_id foreign key migration
```

### قاعدة البيانات المطلوبة

```sql
-- Migration stub (لا تُنفَّذ حتى تاجتاز اختبارات المسارات الأربعة)
CREATE TABLE employers (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    logo_url        VARCHAR(255),
    contact_email   VARCHAR(255),
    is_verified     BOOLEAN DEFAULT FALSE,  -- ← نقطة تكامل مع V2
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

ALTER TABLE jobs ADD COLUMN employer_id BIGINT UNSIGNED REFERENCES employers(id);
```

---

## V2 — حساب صاحب العمل الذاتي (Self-Service Employer)

> **المفهوم:** صاحب العمل يسجّل بنفسه، وينتظر موافقة Admin

### @planned الميزات المطلوبة

```gherkin
@planned
Feature: Employer Self-Registration & Moderation

  Scenario: Employer registers and awaits verification
    Given I am on the employer registration page (NEW - /employer/register)
    When I fill company details and submit
    Then my account status is "pending" (is_verified = false)
    And I see "في انتظار مراجعة فريقنا"
    And Admin receives notification of new employer registration
    # Requires: employer auth routes + is_verified field + notification system

  Scenario: Admin verifies employer
    Given an employer with is_verified = false exists
    When Admin clicks "تحقق" next to the employer
    Then is_verified is set to true
    And the employer can now publish jobs
    # Requires: PATCH /admin/employers/:id/verify endpoint

  Scenario: Unverified employer cannot publish jobs
    Given I am logged in as unverified employer
    When I try to POST /api/v1/jobs
    Then I receive HTTP 403 "حسابك في انتظار التحقق"
    # Requires: employer middleware checking is_verified
```

### قاعدة البيانات المطلوبة

```sql
-- is_verified field (stub — لا تُطبق قبل بناء V1)
-- يُضاف لجدول employers (أو users إذا دُمج)
ALTER TABLE employers ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE employers ADD COLUMN verified_at TIMESTAMP NULL;
ALTER TABLE employers ADD COLUMN verified_by BIGINT UNSIGNED NULL REFERENCES users(id);
```

---

## V3 — نظام المراجعة والموافقة على الوظائف

```gherkin
@planned
Feature: Job Moderation Workflow

  Scenario: Employer submits job for review
    Given I am a verified employer
    When I submit a new job posting
    Then the job status is "draft" (not public)
    And Admin sees it in the moderation queue
    # Requires: jobs.status ENUM('draft','pending','active','rejected')

  Scenario: Admin approves job
    Given a job with status "pending" exists
    When Admin clicks "نشر"
    Then the job status changes to "active"
    And the job becomes visible in the public listings
    # Requires: PATCH /admin/jobs/:id/status endpoint

  Scenario: Admin rejects job with reason
    Given a job with status "pending" exists
    When Admin clicks "رفض" and enters a reason
    Then the job status changes to "rejected"
    And the employer is notified
    # Requires: rejection_reason field + notification system
```

---

## خارطة التنفيذ المقترحة

```
المرحلة 0 (الحالية):
  ✅ اختبار المسارات الأربعة الموجودة تحت .claude/tests/
  ✅ جميع اختبارات @active تجتاز بنجاح

المرحلة 1 (V1 Managed Employer):
  □ إنشاء migration جدول employers
  □ إضافة تبويب "أصحاب العمل" في Admin.jsx
  □ ربط الوظائف بأصحاب العمل (employer_id)
  □ كتابة اختبارات @active لـ employer CRUD

المرحلة 2 (V2 Self-Service):
  □ تطبيق is_verified migration
  □ إنشاء /employer/register صفحة
  □ إضافة employer middleware
  □ كتابة اختبارات @active للتحقق والموافقة

المرحلة 3 (V3 Moderation):
  □ إضافة jobs.status ENUM
  □ بناء moderation queue في Admin
  □ نظام إشعارات (بريد إلكتروني)
  □ كتابة اختبارات @active للـ workflow الكامل
```

---

## قاعدة مهمة

لا يُنقل أي سيناريو من هذا الملف إلى `.claude/tests/` حتى:
1. يُنشأ الكود الفعلي في الـ backend والـ frontend
2. يُختبر يدوياً أو عبر verification-agent
3. تُحدَّث SPEC-KIT.md بـ contract الـ API الجديد
