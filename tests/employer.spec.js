import { test, expect } from '@playwright/test'

test('employer dashboard - unauthenticated shows login message', async ({ page }) => {
  await page.goto('/employer/dashboard')
  await page.evaluate(() => localStorage.removeItem('auth_token'))
  await page.reload()
  await expect(page.locator('text=يتطلب تسجيل الدخول')).toBeVisible({ timeout: 8000 })
})

test('employer dashboard - page renders', async ({ page }) => {
  await page.goto('/employer/dashboard')
  await expect(page.locator('text=لوحة صاحب العمل')).toBeVisible({ timeout: 8000 })
})

test('employer dashboard - post job button hidden when unauthenticated', async ({ page }) => {
  await page.goto('/employer/dashboard')
  await page.evaluate(() => localStorage.removeItem('auth_token'))
  await page.reload()
  await expect(page.locator('text=نشر وظيفة')).not.toBeVisible()
})
