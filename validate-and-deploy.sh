#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SaudiCareers — Post-Deploy Validation Script
# §8 / §11 / §12: Run after every production deploy
# Usage: bash validate-and-deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

APP_DIR="/home/1600726.cloudwaysapps.com/gaczagbrjk/public_html"
BACKEND="$APP_DIR/backend"
APP_URL="https://saudicareers.site"
API_URL="$APP_URL/api/v1"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }

echo ""
echo "══════════════════════════════════════════"
echo "  SaudiCareers Post-Deploy Validation"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════"

# ── §8: Backend cache rebuild ──────────────────────────────────
echo ""
echo "► Backend: Caches"
cd "$BACKEND"
php artisan config:clear  && php artisan config:cache  && pass "config:cache"
php artisan route:clear   && php artisan route:cache   && pass "route:cache"
php artisan view:clear    && php artisan view:cache    && pass "view:cache"

# ── §8: APP_DEBUG guard ───────────────────────────────────────
echo ""
echo "► Security: APP_DEBUG"
grep -q "APP_DEBUG=false" .env && pass "APP_DEBUG=false" || fail "APP_DEBUG is NOT false — fix before going live"

# ── §6: Generate sitemap ──────────────────────────────────────
echo ""
echo "► Sitemap"
php artisan sitemap:generate && pass "sitemap.xml generated → $APP_DIR/public/sitemap.xml"

# ── §4: API response time ─────────────────────────────────────
echo ""
echo "► Performance: API"
TIME=$(curl -o /dev/null -s -w "%{time_total}" "$API_URL/jobs")
echo "  GET /api/v1/jobs → ${TIME}s"
(( $(echo "$TIME < 0.5" | bc -l) )) && pass "Response < 0.5s (likely cached)" || warn "Response > 0.5s — check Redis cache"

# ── §11 Gotcha #2: JS MIME type ───────────────────────────────
echo ""
echo "► Nginx: JS MIME type"
JS_FILE=$(ls "$APP_DIR/assets/"*.js 2>/dev/null | head -1 | xargs basename)
if [ -n "$JS_FILE" ]; then
  CT=$(curl -sI "$APP_URL/assets/$JS_FILE" | grep -i "^content-type:" | tr -d '\r')
  echo "  $CT"
  echo "$CT" | grep -qi "javascript" && pass "JS served as application/javascript" || fail "WRONG MIME — Nginx static block missing"
else
  warn "No .js file found in assets/ — run npm run build first"
fi

# ── §4: similar_jobs in show response ─────────────────────────
echo ""
echo "► API: similar_jobs field"
RESP=$(curl -s "$API_URL/jobs/1")
echo "$RESP" | grep -q "similar_jobs" && pass "similar_jobs present in /jobs/1" || warn "similar_jobs missing (job id=1 may not exist)"

echo ""
echo "══════════════════════════════════════════"
echo "  Manual Checklist (requires browser)"
echo "══════════════════════════════════════════"
cat << 'EOF'

Performance:
  [ ] npx lighthouse https://saudicareers.site --view
      Target: Performance >85, FCP <1.5s, LCP <2.5s
  [ ] DevTools → Network → Throttle to "Fast 3G"
      → Verify JobSkeleton shows before jobs load

SEO:
  [ ] https://search.google.com/test/rich-results
      URL: https://saudicareers.site/jobs/1
      Expected: JobPosting schema detected
  [ ] View page source on /jobs/1
      → <title> contains job.title + company
      → <meta name="description"> present
      → <script type="application/ld+json"> present in <head>

API:
  [ ] GET /api/v1/jobs             → data[], meta{}, links{}
  [ ] GET /api/v1/jobs?category=tech&page=2
  [ ] GET /api/v1/jobs/1           → data{} + similar_jobs[]
  [ ] POST /api/v1/login (wrong x6) → HTTP 429 (throttle works)

UX:
  [ ] /jobs/:id → "وظائف قد تهمك" section renders ≤3 cards
  [ ] Open ApplyModal → name field is focused immediately
  [ ] ApplyModal: enter bad email → click away → red error appears
  [ ] ApplyModal: drag PDF onto upload zone → filename + size shown
  [ ] Submit application → progress bar visible → success state
  [ ] Success state → click "قدّم على وظائف مشابهة" → navigates correctly

Cache:
  [ ] Login as admin → jobs endpoint returns fresh data
  [ ] Guest: 2nd call to /api/v1/jobs faster than 1st (Redis hit)
  [ ] Create/edit/delete job as admin → guest cache invalidated

──────────────────────────────────────────
SPEC-KIT.md Sections to update after deploy:
  §2  — GET /api/v1/jobs: add location, experience_level params
  §2  — GET /api/v1/jobs/{id}: response includes similar_jobs[]
  §4  — Job show response: add similar_jobs shape
  §6  — api.js: jobsApi.getById returns {data, similar_jobs}
  §8  — Nginx: document gzip block
  §8  — Build: add react-helmet-async to dependencies
  §11 — Gotcha #11: Cache flushed on job write (store/update/destroy)
  §11 — Gotcha #12: http2_push requires exact paths — use <link rel=preload> instead
──────────────────────────────────────────
EOF

echo ""
echo "Validation script done. Fix any ✗ items before sharing the URL."
echo ""
