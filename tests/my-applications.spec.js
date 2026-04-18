import { test, expect } from '@playwright/test'

test.describe('My Applications', () => {
  test('requires auth when no token', async ({ page }) => {
    await page.goto('/my-applications')
    await expect(page.locator('text=طلباتي')).toBeVisible()
    await expect(page.locator('text=يتطلب تسجيل الدخول')).toBeVisible()
  })

  test('shows applications list with status badges when authenticated', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'test-token'))

    await page.route('**/api/v1/applications/my', route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 1, job_title: 'مطور Full Stack', company: 'STC',
            status: 'reviewed', applied_at: '2026-04-18', tracking_token: 'abc123' },
        ]}) })
    )

    await page.goto('/my-applications')
    await expect(page.locator('text=مطور Full Stack')).toBeVisible()
    await expect(page.locator('text=تمت المراجعة')).toBeVisible()
    await expect(page.locator('text=تتبع')).toBeVisible()
  })
})
