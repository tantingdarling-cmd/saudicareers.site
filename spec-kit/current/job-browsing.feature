# .claude/tests/job-browsing.feature
# Source of truth: SPEC-KIT.md §2.1 / §4.1 / §4.3
# Components: src/pages/Home.jsx + src/components/ApplyModal.jsx
# API: GET /api/v1/jobs | POST /api/v1/applications
# Last updated: 2026-04-14

Feature: Job Browsing & Application Flow

  Background:
    Given the dev server is running at "http://localhost:5173"
    And I navigate to "http://localhost:5173"
    And the page finishes loading

  # ── Scenario 1: الصفحة الرئيسية تُحمّل الوظائف ────────────────────

  @smoke
@active
  Scenario: Homepage loads jobs (API or fallback)
    Then the heading "طريقك للفرصة" is visible
    And a jobs grid is visible in the section with id "jobs"
    And at least 1 job card is displayed
    And the browser console has no errors
    # ملاحظة: إذا فشل API تُعرض 12 وظيفة من FALLBACK_JOBS (src/data/index.js)

  # ── Scenario 2: فلترة الوظائف بالتصنيف ──────────────────────────

  @smoke
@active
  Scenario: Category filter shows relevant jobs
    Given jobs are loaded and visible
    When I click the filter button "تقنية"
    Then only job cards with category "tech" are visible
    And the "تقنية" button has active styling (dark background)
    When I click the filter button "الكل"
    Then all job cards are visible again

  # ── Scenario 3: الانتقال لصفحة تفاصيل الوظيفة ───────────────────

  @smoke
@active
  Scenario: Clicking a job card navigates to job detail page
    Given at least 1 job card is visible
    When I click the first job card
    Then the URL changes to match "/jobs/"
    And the page shows the job title and company name

  # ── Scenario 4: فتح ApplyModal والتقديم الناجح ───────────────────

  @smoke @critical
@active
  Scenario: Apply button opens modal and successful submission
    Given at least 1 job card is visible
    When I click the "تقدم الآن" button on the first job card
    Then a modal overlay appears with title "تقديم الطلب"
    And the "اسمك الكريم" input is auto-focused
    And the job title and company are shown in a preview block

    When I fill "اسمك الكريم" with "محمد اختبار"
    And I fill "بريدك الإلكتروني" with "test@example.com"
    And I click "تأكيد التقديم النهائي"
    Then a POST request is sent to "/api/v1/applications" with:
      | field   | value          |
      | job_id  | the job's id   |
      | name    | محمد اختبار   |
      | email   | test@example.com |
    And on success (200 or 201) the text "تم إرسال طلبك!" appears
    And the button "قدّم على وظائف مشابهة" is visible

  # ── Scenario 5: تحقق validation في الـ Modal ─────────────────────

  @validation
@active
  Scenario: Modal blocks submission with empty required fields
    Given the ApplyModal is open for any job
    When I click "تأكيد التقديم النهائي" without filling any field
    Then the error "الاسم مطلوب" appears under the name field
    And the error "بريد إلكتروني غير صحيح" appears under the email field
    And NO POST request is sent to "/api/v1/applications"

@active
  Scenario: Modal validates email format on blur
    Given the ApplyModal is open
    When I type "invalid-email" in the email field and move focus away
    Then the error "بريد إلكتروني غير صحيح" appears immediately

  # ── Scenario 6: رفع ملف CV في الـ Modal ─────────────────────────

  @validation
@active
  Scenario: CV file upload accepts PDF, DOC, DOCX up to 5MB
    Given the ApplyModal is open
    When I attach a ".pdf" file smaller than 5MB to the CV input
    Then the file name and size appear in the upload zone
    And no error is shown

@active
  Scenario: CV upload rejects files over 5MB
    Given the ApplyModal is open
    When I attach a file larger than 5MB
    Then the error "حجم الملف يجب أن لا يتجاوز 5 ميغابايت" is visible
    And the file is not set

  # ── Scenario 7: إغلاق الـ Modal ─────────────────────────────────

  @smoke
@active
  Scenario: Modal closes when clicking outside or X button
    Given the ApplyModal is open
    When I click the X button in the top corner
    Then the modal disappears and body scroll is restored

    Given the ApplyModal is open
    When I click the dark overlay outside the modal
    Then the modal disappears
