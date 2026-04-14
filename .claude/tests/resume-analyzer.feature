# .claude/tests/resume-analyzer.feature
# Source of truth: SPEC-KIT.md §2.1 / §4.6 / §9
# Derived from actual component code: src/pages/ResumeAnalyzer.jsx + src/pages/ResumeResults.jsx
# API endpoint: POST /api/v1/resume/analyze (throttle: 3 req/min per IP)
# Last updated: 2026-04-14

Feature: Resume ATS Analyzer — Upload & Results Flow

  Background:
    Given the dev server is running at "http://localhost:5173"
    And I navigate to "http://localhost:5173/resume-analyzer"
    And the page finishes loading (no pending network requests)

  # ── Scenario 1: الصفحة تُحمّل صحيحاً ─────────────────────────────

  @smoke
  Scenario: Page renders correctly in idle state
    Then the page title is "افحص سيرتك ضد ATS مجاناً | سعودي كارييرز"
    And the heading contains "اختبر سيرتك ضد"
    And the text "مجاناً تماماً — لا يلزم تسجيل" is visible
    And the text "اسحب ملف PDF هنا أو اضغط للاختيار" is visible
    And the text "PDF فقط · الحد الأقصى 2MB" is visible
    And a hidden "input[type='file'][accept='.pdf']" exists in the DOM
    And the browser console has no errors

  # ── Scenario 2: رفع PDF صالح → الانتقال لصفحة النتائج ────────────

  @smoke @critical
  Scenario: Valid PDF upload triggers analysis and redirects to results
    Given I have a PDF file named "test-cv.pdf" smaller than 2MB
    When I attach "test-cv.pdf" to "input[type='file']"
    Then the progress text matches /جارٍ رفع الملف\.\.\. \d+٪/
    And a POST request is sent to "/api/v1/resume/analyze" with Content-Type "multipart/form-data"
    And within 15000ms the URL changes to match "/resume-results/"
    And the new page contains a score number between 0 and 100
    And the browser console has no unhandled errors

  # ── Scenario 3: صفحة النتائج تعرض المكونات الصحيحة ────────────────

  @smoke @critical
  Scenario: Results page displays all 4 layers from API contract
    Given I have already analyzed a PDF and am on "/resume-results/:id"
    Then a circular SVG score ring is visible and animates from 0
    And the following check labels are visible:
      | معلومات التواصل           |
      | عناوين ATS قياسية         |
      | كثافة الكلمات المفتاحية   |
    And each check row shows either "اجتاز ✓" or "لم يجتز"
    And the CTA button "سجّل واحصل على التحسين الكامل" is visible
    And the button "فحص جديد" is visible and navigates to "/resume-analyzer"

  # ── Scenario 4: رفع ملف غير PDF → يُرفض ─────────────────────────

  @validation
  Scenario: Non-PDF file is silently rejected by file input filter
    When I try to attach a ".docx" file to "input[type='file']"
    Then the file input rejects it (accept=".pdf" filter)
    And NO POST request is sent to "/api/v1/resume/analyze"
    And the page remains in idle state showing the upload zone

  # ── Scenario 5: PDF أكبر من 2MB → خطأ 422 ───────────────────────

  @validation @edge-case
  Scenario: PDF over 2MB shows 422 error message
    Given I have a PDF file named "large-cv.pdf" larger than 2MB
    When I attach "large-cv.pdf" to "input[type='file']"
    And the POST request returns HTTP 422
    Then an error message is visible in red
    And the "حاول مجدداً" button is visible
    And clicking "حاول مجدداً" returns the page to idle upload state

  # ── Scenario 6: تجاوز الحد → خطأ 429 ────────────────────────────

  @edge-case
  Scenario: 4th upload attempt within 1 minute shows 429 error
    Given I have successfully submitted 3 PDF analysis requests within 1 minute
    When I submit a 4th request
    Then the POST request returns HTTP 429
    And the error message contains "وصلت للحد الأقصى"

  # ── Scenario 7: refresh على صفحة النتائج ─────────────────────────

  @edge-case
  Scenario: Hard refresh on results page with valid localStorage ID
    Given I am on "/resume-results/:id" with a valid entry in localStorage
    When I hard refresh the page (F5)
    Then the results are still displayed correctly (loaded from localStorage)

  Scenario: Hard refresh on results page with missing/expired ID
    Given I navigate directly to "/resume-results/invalid-id-xyz"
    Then I am redirected to "/resume-analyzer" automatically
    And the upload zone is visible

  # ── Scenario 8: التنقل من صفحة النتائج ──────────────────────────

  @navigation
  Scenario: Navbar scroll buttons work from results page
    Given I am on "/resume-results/:id"
    When I click the nav button "الوظائف"
    Then the URL changes to "/"
    And the page scrolls to the jobs section

  Scenario: CTA button navigates to home signup section
    Given I am on "/resume-results/:id"
    When I click "سجّل واحصل على التحسين الكامل"
    Then the URL changes to "/"
    And the page scrolls to the signup form section

  # ── Scenario 9: حجم الـ bundle (من نتائج build الفعلية) ──────────

  @performance
  Scenario: Route chunk size within acceptable limits
    # Based on actual npm run build output — do not adjust without re-running build
    Then the chunk "ResumeAnalyzer" is ≤ 6KB gzipped    # actual: 2.78KB
    And the chunk "ResumeResults"  is ≤ 12KB gzipped   # actual: 4.44KB
    And the chunk "vendor"         is ≤ 55KB gzipped   # actual: 52.89KB
