# .claude/tests/admin.feature
# Source of truth: SPEC-KIT.md §4.2 / §4.5
# Components: src/pages/Admin.jsx
# APIs: POST /api/v1/login | GET+POST+PATCH+DELETE /admin/* (Bearer token required)
# Last updated: 2026-04-14

Feature: Admin Dashboard — Login, Jobs CRUD, Applications & Subscribers

  Background:
    Given the dev server is running at "http://localhost:5173"

  # ── Scenario 1: الصفحة تُظهر نموذج تسجيل الدخول للزوار ──────────

  @smoke
@active
  Scenario: /admin shows login form when unauthenticated
    Given no admin token is stored in localStorage
    When I navigate to "http://localhost:5173/admin"
    And the page finishes loading
    Then the login form is visible (not the dashboard)
    And an email input is present
    And a password input is present
    And a submit button with text "دخول" is present
    And the dashboard tab bar is NOT visible

  # ── Scenario 2: Hard refresh بدون token → نموذج تسجيل الدخول ──────

  @smoke
@active
  Scenario: Hard refresh on /admin without stored token shows login
    Given localStorage key "admin_token" is absent
    When I navigate directly to "http://localhost:5173/admin"
    Then the login form is rendered (Admin.jsx calls authApi.isAuthenticated() on mount)
    And NO GET request is sent to "/api/v1/jobs" (unauthenticated guard)

  # ── Scenario 3: بيانات خاطئة → رسالة خطأ ──────────────────────

  @smoke
@active
  Scenario: Wrong credentials shows Arabic error message
    Given I am on the admin login form
    When I fill the email input with "wrong@example.com"
    And I fill the password input with "wrongpassword"
    And I click "دخول"
    Then a POST request is sent to "/api/v1/login" with:
      | field       | value             |
      | email       | wrong@example.com |
      | password    | wrongpassword     |
      | device_name | admin             |
    And on HTTP 401 the error "فشل تسجيل الدخول" appears below the form
    And the dashboard is still NOT visible

@active
  Scenario: Empty form shows inline validation message
    Given I am on the admin login form
    When I click "دخول" without filling email or password
    Then the error "الرجاء إدخال البريد وكلمة المرور" appears
    And NO POST request is sent to "/api/v1/login"

  # ── Scenario 4: تسجيل دخول ناجح ────────────────────────────────

  @smoke @critical
@active
  Scenario: Successful login reveals the dashboard
    Given I am on the admin login form
    When I fill the email input with a valid admin email
    And I fill the password input with the correct password
    And I click "دخول"
    Then a POST request is sent to "/api/v1/login"
    And on HTTP 200 the dashboard is visible
    And the tab "الوظائف" is the active default tab
    And a GET request is sent to "/api/v1/jobs" with Bearer token
    And the logout button (LogOut icon) is visible in the header

  # ── Scenario 5: قائمة الوظائف ──────────────────────────────────

  @smoke
@active
  Scenario: Jobs tab displays fetched jobs list
    Given I am logged in as admin
    And the "الوظائف" tab is active
    Then a list of job rows is visible (or empty state if no jobs)
    And each job row has an edit button (Pencil icon) and a delete button (Trash2 icon)
    And the button "+ إضافة وظيفة" is visible

  # ── Scenario 6: إضافة وظيفة جديدة ──────────────────────────────

  @critical
@active
  Scenario: Creating a new job posts to /api/v1/jobs
    Given I am logged in as admin
    When I click "+ إضافة وظيفة"
    Then a job form panel slides in (or appears)
    And the form has inputs for: title, company, location, description

    When I fill "عنوان الوظيفة" with "مطور واجهات"
    And I fill "الشركة" with "شركة الاختبار"
    And I fill "الموقع" with "الرياض"
    And I click the save button (Save icon)
    Then a POST request is sent to "/api/v1/jobs" with Bearer token and:
      | field   | value          |
      | title   | مطور واجهات    |
      | company | شركة الاختبار  |
      | location| الرياض         |
    And on success (200/201) the new job appears in the list
    And the form panel closes

@active
  Scenario: Save is silently blocked when title/company/location are empty
    # Admin.jsx line 173: if (!form.title || !form.company || !form.location) return
    Given I am logged in as admin
    When I click "+ إضافة وظيفة"
    And I leave title, company, and location empty
    And I click the save button
    Then NO POST request is sent to "/api/v1/jobs"

  # ── Scenario 7: تعديل وظيفة ────────────────────────────────────

  @critical
@active
  Scenario: Editing a job sends PATCH/PUT to /api/v1/jobs/:id
    Given I am logged in as admin
    And at least 1 job is listed
    When I click the edit (Pencil) button on the first job
    Then the form panel opens pre-filled with that job's data
    When I change the title and click save
    Then a PATCH/PUT request is sent to "/api/v1/jobs/{id}" with Bearer token
    And the updated title appears in the job list

  # ── Scenario 8: حذف وظيفة ──────────────────────────────────────

  @critical
@active
  Scenario: Deleting a job sends DELETE to /api/v1/jobs/:id
    Given I am logged in as admin
    And at least 1 job is listed
    When I click the delete (Trash2) button on a job
    Then a browser confirm dialog appears with "هل أنت متأكد من حذف هذه الوظيفة؟"
    When I confirm the dialog
    Then a DELETE request is sent to "/api/v1/jobs/{id}" with Bearer token
    And the job is removed from the list

  # ── Scenario 9: تبويب الطلبات ─────────────────────────────────

  @smoke
@active
  Scenario: Applications tab loads and displays submissions
    Given I am logged in as admin
    When I click the "الطلبات" tab
    Then a GET request is sent to "/admin/applications" with Bearer token
    And each application row shows applicant name, email, and job title
    And each row has status buttons: "قبول", "رفض"

@active
  Scenario: Updating application status sends PATCH to /admin/applications/:id/status
    Given I am on the Applications tab with at least 1 application
    When I click the "قبول" button on the first application
    Then a PATCH request is sent to "/admin/applications/{id}/status" with:
      | field  | value    |
      | status | accepted |
    And the application row updates to show the new status badge

  # ── Scenario 10: تبويب المشتركين ─────────────────────────────

  @smoke
@active
  Scenario: Subscribers tab loads subscriber list
    Given I am logged in as admin
    When I click the "المشتركون" tab
    Then a GET request is sent to "/admin/subscribers" with Bearer token
    And the subscriber list is visible with name, email, field columns

@active
  Scenario: Export CSV downloads a file
    Given I am on the Subscribers tab with at least 1 subscriber
    When I click the download (CSV) button
    Then a CSV file is downloaded containing the subscriber data
    And the file name matches "subscribers-YYYY-MM-DD.csv"

@active
  Scenario: Copy emails button copies all emails to clipboard
    Given I am on the Subscribers tab with at least 1 subscriber
    When I click the copy (Mail) button
    Then all subscriber emails are copied to clipboard (comma-separated)
    And the button briefly shows a "تم النسخ" confirmation state

  # ── Scenario 11: تسجيل الخروج ────────────────────────────────

  @smoke
@active
  Scenario: Logout clears token and returns to login form
    Given I am logged in as admin
    When I click the logout (LogOut icon) button
    Then a POST request is sent to "/logout" with Bearer token
    And localStorage "admin_token" is cleared
    And the login form is visible again
    And the dashboard is no longer visible
