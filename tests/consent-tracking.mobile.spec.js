/**
 * SaudiCareers — Consent + Tracking Flow
 * Priority: P0 — must pass before any ad campaign goes live
 * Run: npx playwright test consent-tracking.mobile.spec.js
 */

import { test, expect } from '@playwright/test'

const CONSENT_KEY = 'consent_analytics'
const BANNER_TEXT  = 'ملفات تعريف الارتباط'   // partial match — stable against copy changes
const ACCEPT_BTN   = 'button:has-text("موافق")'
const HERO_CTA     = '[data-track="hero_cta"]'
const FIRST_JOB    = 'a[href^="/jobs/"]'         // JobCard has no className — target the link

// Inject spy BEFORE page scripts so SDK guards (if(e.snaptr)return) keep our mock
async function injectPixelSpy(page) {
  await page.addInitScript(() => {
    window.__pixelLogs = []
    // Snapchat SDK guard: if(e.snaptr)return — our mock survives
    window.snaptr = (action, event, params) => {
      window.__pixelLogs.push({ pixel: 'snapchat', action, event, params })
    }
    // Twitter SDK guard: e.twq||(s=e.twq=...) — our mock survives
    window.twq = (action, event, params) => {
      window.__pixelLogs.push({ pixel: 'twitter', action, event, params })
    }
  })
}

// Block SDK network fetches so they don't overwrite our spies
async function blockPixelSdks(page) {
  await page.route('**/scevent.min.js',   r => r.fulfill({ status: 200, body: '' }))
  await page.route('**/uwt.js',           r => r.fulfill({ status: 200, body: '' }))
}

async function getPixelLogs(page) {
  return page.evaluate(() => window.__pixelLogs ?? [])
}

// ── Suite ────────────────────────────────────────────────────────────────────
test.describe('Consent + Tracking — Mobile', () => {

  test.beforeEach(async ({ page }) => {
    await blockPixelSdks(page)
    await injectPixelSpy(page)
  })

  // 1. Banner appears on first visit (no prior consent)
  test('shows consent banner on first visit', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(`text=${BANNER_TEXT}`)).toBeVisible()
    await expect(page.locator(ACCEPT_BTN)).toBeVisible()
  })

  // 2. Pixels stay silent before consent — even after navigating to a job
  test('pixels silent before consent', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(FIRST_JOB).first()).toBeVisible()
    await page.locator(FIRST_JOB).first().click()
    await page.waitForURL(/\/jobs\/\d+/)

    const logs = await getPixelLogs(page)
    expect(logs).toHaveLength(0)
  })

  // 3. Accepting consent persists flag and hides banner
  test('accept consent → stores flag, hides banner', async ({ page }) => {
    await page.goto('/')
    await page.locator(ACCEPT_BTN).click()

    await expect(page.locator(`text=${BANNER_TEXT}`)).toBeHidden()

    const stored = await page.evaluate(k => localStorage.getItem(k), CONSENT_KEY)
    expect(stored).toBe('true')
  })

  // 4. view_job pixel fires on JobDetail AFTER consent
  test('view_job fires on JobDetail after consent', async ({ page }) => {
    await page.addInitScript(k => localStorage.setItem(k, 'true'), CONSENT_KEY)

    // Mock backend — no real server needed in dev
    await page.route('**/api/v1/jobs/1', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 1, title: 'مطور Full Stack', company: 'STC', category: 'tech' } }),
    }))

    // Navigate directly to job detail — skips home click flow
    await page.goto('/jobs/1')
    await page.waitForURL(/\/jobs\/1/)

    await expect.poll(
      async () => {
        const logs = await getPixelLogs(page)
        return logs.some(l => l.event === 'VIEW_CONTENT' || l.event === 'tw-ViewContent')
      },
      { timeout: 5000 }
    ).toBe(true)
  })

  // 5. Returning visitor: no banner, pixels ready immediately
  test('returning visitor skips banner', async ({ page }) => {
    await page.addInitScript(k => localStorage.setItem(k, 'true'), CONSENT_KEY)

    await page.goto('/')
    await expect(page.locator(`text=${BANNER_TEXT}`)).toBeHidden()
  })

  // 6. Hero CTA has correct tracking attribute and link
  test('hero CTA has data-track and href', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator(HERO_CTA)
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('data-track', 'hero_cta')
    await expect(cta).toHaveAttribute('href', '/resume-analyzer')
  })

  // 7. start_application fires when apply modal opens (with consent)
  test('start_application fires on modal open after consent', async ({ page }) => {
    await page.addInitScript(k => localStorage.setItem(k, 'true'), CONSENT_KEY)

    await page.route('**/api/v1/jobs**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [{ id: 1, title: 'مطور Full Stack', company: 'STC', location: 'الرياض',
          category: 'tech', job_type: 'full_time', experience_level: 'mid',
          is_featured: false, salary: '20,000 ر.س', posted_at: 'حديثاً' }],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      }),
    }))

    await page.goto('/')
    // click the "قدّم الآن" button on the first job card
    await page.locator('button:has-text("التقديم")').first().click()

    await expect.poll(
      async () => {
        const logs = await getPixelLogs(page)
        return logs.some(l => l.event === 'START_CHECKOUT' || l.event === 'tw-InitiateCheckout')
      },
      { timeout: 5000 }
    ).toBe(true)
  })

  // 8. start_application does NOT fire without consent
  test('start_application silent without consent', async ({ page }) => {
    await page.route('**/api/v1/jobs**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [{ id: 1, title: 'مطور Full Stack', company: 'STC', location: 'الرياض',
          category: 'tech', job_type: 'full_time', experience_level: 'mid',
          is_featured: false, salary: '20,000 ر.س', posted_at: 'حديثاً' }],
        meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
      }),
    }))

    await page.goto('/')
    await page.locator('button:has-text("التقديم")').first().click()

    // wait a moment to confirm silence
    await page.waitForTimeout(1000)
    const logs = await getPixelLogs(page)
    expect(logs.filter(l => l.event === 'START_CHECKOUT' || l.event === 'tw-InitiateCheckout')).toHaveLength(0)
  })

  // 9. Single-column layout on mobile (≤767 px)
  test('hero collapses to single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const colCount = await page.locator('.hero-grid').evaluate(el => {
      // getComputedStyle returns resolved pixel values (e.g. "375px"), NOT "1fr".
      // Split by spaces to count how many column tracks exist.
      return window.getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length
    })
    expect(colCount).toBe(1)

    // Decorative visual column must be hidden
    const decorativeHidden = await page.locator('.hero-grid > *:last-child').evaluate(el =>
      window.getComputedStyle(el).display === 'none'
    )
    expect(decorativeHidden).toBe(true)
  })
})
