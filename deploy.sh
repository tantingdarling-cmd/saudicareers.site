#!/bin/bash
# ===========================================
# SaudiCareers Deployment Script
# Run on Cloudways Server
# ===========================================

set -e

echo "Starting deployment for saudicareers.site..."

# ── Cloudways paths ────────────────────────────────────────
APP_DIR="/home/1600726.cloudwaysapps.com/gaczagbrjk/public_html"
PUBLIC_DIR="$APP_DIR"          # ← Cloudways webroot IS public_html/ directly
BACKEND_DIR="$APP_DIR/backend"

cd "$APP_DIR"

# ── Pull latest code ───────────────────────────────────────
echo "► Pulling latest code..."
git pull origin main

# ===========================================
# BACKEND
# ===========================================
echo "► Setting up Backend..."

cd "$BACKEND_DIR"

composer install --no-dev --optimize-autoloader --prefer-dist

# Create .env on first deploy
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    php artisan key:generate
fi

if grep -q "APP_DEBUG=true" .env; then
    echo "WARNING: APP_DEBUG=true detected — set to false for production!"
fi

php artisan migrate --force

if [ ! -L public/storage ]; then
    php artisan storage:link
fi

php artisan db:seed --class=AdminUserSeeder --force 2>/dev/null || true

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

chmod -R 775 storage bootstrap/cache

echo "Backend ready!"

# ===========================================
# FRONTEND
# ===========================================
echo "► Building Frontend..."

cd "$APP_DIR"

npm ci --prefer-offline
npm run build

# Copy React index.html → webroot
cp dist/index.html "$PUBLIC_DIR/index.html"

# Sync assets (wipe old hashed filenames, copy fresh ones)
rm -rf "$PUBLIC_DIR/assets"
cp -r dist/assets "$PUBLIC_DIR/assets"
chmod -R 755 "$PUBLIC_DIR/assets"

# Copy static files (robots, sitemap, og-image, favicon, etc.)
for f in dist/*.txt dist/*.xml dist/*.svg dist/*.png dist/*.ico dist/*.webmanifest; do
    [ -f "$f" ] && cp "$f" "$PUBLIC_DIR/" && echo "  Copied: $(basename $f)"
done

# Verify critical files exist
echo "► Verifying deploy..."
[ -f "$PUBLIC_DIR/index.html" ]      && echo "  ✓ index.html"    || echo "  ✗ MISSING: index.html"
[ -d "$PUBLIC_DIR/assets" ]          && echo "  ✓ assets/"       || echo "  ✗ MISSING: assets/"
[ -f "$BACKEND_DIR/public/index.php" ] && echo "  ✓ Laravel API"  || echo "  ✗ MISSING: backend/public/index.php"

echo "Frontend deployed!"

# ===========================================
# RESTART QUEUE WORKER
# ===========================================
echo "► Restarting queue worker..."

pkill -f "queue:work" 2>/dev/null || true
sleep 1
cd "$BACKEND_DIR"
nohup php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 \
  >> storage/logs/queue.log 2>&1 &

echo ""
echo "==================================="
echo "Deployment complete!"
echo "Site   : https://saudicareers.site"
echo "Admin  : https://saudicareers.site/admin"
echo "Sitemap: https://saudicareers.site/sitemap.xml"
echo "==================================="
