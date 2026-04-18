import { test, expect } from '@playwright/test'

test.describe('Job Alerts', () => {
  test('alert page renders form and requires auth for API', async ({ page }) => {
    await page.goto('/alerts')
    await expect(page.locator('text=تنبيهات الوظائف')).toBeVisible()
    // no token → shows login prompt
    await expect(page.locator('text=يتطلب تسجيل الدخول')).toBeVisible()
  })

  test('alert form creates alert when authenticated', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test-token'))

    await page.route('**/api/v1/alerts', route => {
      if (route.request().method() === 'GET')
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: [] }) })
      if (route.request().method() === 'POST')
        return route.fulfill({ status: 201, contentType: 'application/json',
          body: JSON.stringify({ data: { id: 1, keyword: 'محاسب', location: 'الرياض',
            frequency: 'instant', active: true } }) })
    })

    await page.goto('/alerts')
    await page.locator('input[placeholder*="محاسب"]').fill('محاسب')
    await page.locator('input[placeholder*="الرياض"]').fill('الرياض')
    await page.locator('button:has-text("إضافة تنبيه")').click()

    await expect(page.locator('text=محاسب')).toBeVisible()
  })
})
