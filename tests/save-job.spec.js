import { test, expect } from '@playwright/test'

test.describe('Save Job', () => {
  test('user saves job → appears in /saved', async ({ page }) => {
    await page.route('**/api/v1/jobs**', route => {
      const url = route.request().url()
      if (url.match(/\/jobs\/1$/)) {
        return route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: { id: 1, title: 'مطور Full Stack', company: 'STC',
            location: 'الرياض', category: 'tech', job_type: 'full_time',
            experience_level: 'mid', is_featured: false, salary: '20,000 ر.س', posted_at: 'حديثاً' } }),
        })
      }
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id: 1, title: 'مطور Full Stack', company: 'STC', location: 'الرياض',
            category: 'tech', job_type: 'full_time', experience_level: 'mid',
            is_featured: false, salary: '20,000 ر.س', posted_at: 'حديثاً' }],
          meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
        }),
      })
    })

    await page.goto('/')
    // Click save heart on first job card
    await page.locator('[data-testid="save-job-btn"]').first().click()

    // Verify toast appears
    await expect(page.locator('text=تم الحفظ')).toBeVisible()

    // Verify localStorage updated
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('saved_jobs') || '[]'))
    expect(saved).toContain(1)

    // Navigate to /saved and verify job listed
    await page.goto('/saved')
    await expect(page.locator('text=مطور Full Stack')).toBeVisible()
  })
})
