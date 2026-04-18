import { test, expect } from '@playwright/test'

test.describe('Profile CV Upload', () => {
  test('profile page requires auth when no token', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.locator('text=الملف الشخصي')).toBeVisible()
    await expect(page.locator('text=يتطلب تسجيل الدخول')).toBeVisible()
  })

  test('upload zone visible when authenticated', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test-token'))

    await page.route('**/api/v1/profile/resume', route => {
      if (route.request().method() === 'GET')
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ resume_path: null, resume_url: null }) })
    })

    await page.goto('/profile')
    await expect(page.locator('text=رفع السيرة الذاتية')).toBeVisible()
    await expect(page.locator('text=PDF أو DOCX')).toBeVisible()
  })

  test('shows existing resume filename when uploaded', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test-token'))

    await page.route('**/api/v1/profile/resume', route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ resume_path: 'resumes/cv.pdf',
          resume_url: 'https://saudicareers.site/storage/resumes/cv.pdf' }) })
    )

    await page.goto('/profile')
    await expect(page.locator('text=cv.pdf')).toBeVisible()
    await expect(page.locator('text=استبدال السيرة الذاتية')).toBeVisible()
  })
})
