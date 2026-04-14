# .claude/tests/newsletter.feature
# Source of truth: SPEC-KIT.md §4 / POST /api/v1/subscribe
# Components: src/pages/Home.jsx → SignupForm (line 116) + FooterSignupForm (line 587)
# API: POST /api/v1/subscribe
# Last updated: 2026-04-14

Feature: Newsletter Signup — Main Form & Footer Form

  Background:
    Given the dev server is running at "http://localhost:5173"
    And I navigate to "http://localhost:5173"
    And the page finishes loading

  # ── Scenario 1: النموذج يظهر في قسم signup ────────────────────────

  @smoke
@active
  Scenario: Signup form renders correctly in the signup section
    When I scroll to the element with id "signup"
    Then the heading "احصل على تحسين سيرتك الذاتية مجاناً" is visible
    And the text "سجّل ببريدك الإلكتروني واحصل على مراجعة احترافية خلال 48 ساعة" is visible
    And a text input with placeholder "اسمك الكريم" is present
    And an email input with placeholder "بريدك الإلكتروني" is present
    And a select dropdown with placeholder "مجالك المهني" is present
    And the submit button text is "احصل على تحسين سيرتك مجاناً ←"
    And the text "لا رسائل مزعجة" is visible

  # ── Scenario 2: التسجيل الناجح ────────────────────────────────────

  @smoke @critical
@active
  Scenario: Successful signup shows thank-you message
    When I scroll to the element with id "signup"
    And I fill the "اسمك الكريم" input with "سارة اختبار"
    And I fill the "بريدك الإلكتروني" input with "sara@test.com"
    And I select "تقنية المعلومات" from the field dropdown
    And I click "احصل على تحسين سيرتك مجاناً ←"
    Then a POST request is sent to "/api/v1/subscribe" with:
      | field | value              |
      | name  | سارة اختبار        |
      | email | sara@test.com      |
      | field | تقنية المعلومات    |
    And on success (200 or 201) the text "تم التسجيل! سنتواصل معك خلال 48 ساعة بمراجعة سيرتك الذاتية." is visible
    And the form inputs are no longer visible (replaced by success message)

  # ── Scenario 3: البريد المسجل مسبقاً يُعامل كنجاح ────────────────

  @smoke
@active
  Scenario: Already-registered email still shows success (no error to user)
    # الكود يُعامل الخطأ 'unique'/'already' كنجاح (Home.jsx line 129-131)
    When I scroll to the element with id "signup"
    And I fill the "اسمك الكريم" input with "أحمد مكرر"
    And I fill the "بريدك الإلكتروني" input with "duplicate@test.com"
    And I click "احصل على تحسين سيرتك مجاناً ←"
    Then the text "تم التسجيل! سنتواصل معك خلال 48 ساعة بمراجعة سيرتك الذاتية." is visible

  # ── Scenario 4: زر التسجيل معطّل بدون اسم أو بريد ─────────────────

  @validation
@active
  Scenario: Submit is silently blocked when name is empty
    # Home.jsx line 122: if (!form.name.trim() || !form.email.includes('@')) return
    When I scroll to the element with id "signup"
    And I leave the "اسمك الكريم" input empty
    And I fill the "بريدك الإلكتروني" input with "valid@test.com"
    And I click "احصل على تحسين سيرتك مجاناً ←"
    Then NO POST request is sent to "/api/v1/subscribe"
    And the form remains visible (no success message)

@active
  Scenario: Submit is silently blocked when email has no "@"
    When I scroll to the element with id "signup"
    And I fill the "اسمك الكريم" input with "اسم صحيح"
    And I fill the "بريدك الإلكتروني" input with "invalid-email"
    And I click "احصل على تحسين سيرتك مجاناً ←"
    Then NO POST request is sent to "/api/v1/subscribe"
    And the form remains visible

  # ── Scenario 5: نموذج الـ Footer ─────────────────────────────────

  @smoke
@active
  Scenario: Footer signup form sends POST to /api/v1/subscribe
    # FooterSignupForm (Home.jsx line 587) — name + email only, no field
    When I scroll to the footer of the page
    And I fill the footer name input with "زيد اختبار"
    And I fill the footer email input with "zaid@test.com"
    And I click the footer submit button
    Then a POST request is sent to "/api/v1/subscribe" with:
      | field | value        |
      | name  | زيد اختبار   |
      | email | zaid@test.com |
    And on success the success text is visible in the footer area

  # ── Scenario 6: زر "جارٍ التسجيل..." أثناء الإرسال ──────────────

  @smoke
@active
  Scenario: Button shows loading state during submission
    When I scroll to the element with id "signup"
    And I fill the "اسمك الكريم" input with "اختبار تحميل"
    And I fill the "بريدك الإلكتروني" input with "loading@test.com"
    And I click "احصل على تحسين سيرتك مجاناً ←"
    Then while the request is pending the button text is "...جارٍ التسجيل"
    And the button is disabled during loading

  # ── Scenario 7: التنقل من صفحة أخرى لـ #signup ──────────────────

  @navigation
@active
  Scenario: Navbar CTA from resume-results navigates to signup section
    Given I navigate to "http://localhost:5173/resume-results/test"
    When I click "سجّل واحصل على التحسين الكامل"
    Then the URL changes to "http://localhost:5173/"
    And the page scrolls to the element with id "signup"
