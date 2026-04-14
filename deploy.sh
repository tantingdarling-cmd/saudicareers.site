#!/bin/bash
# ===========================================
# SaudiCareers Deployment Script
# Run on Cloudways Server
# ===========================================

set -e

echo "Starting deployment for saudicareers.site..."

APP_DIR="/var/www/saudicareers"

# Pull latest code
echo "Pulling latest code..."
cd "$APP_DIR"
git pull origin main

# ===========================================
# BACKEND
# ===========================================
echo "Setting up Backend..."

cd "$APP_DIR/backend"

# Install dependencies (no dev packages in production)
composer install --no-dev --optimize-autoloader --prefer-dist

# Setup .env on first deploy
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    php artisan key:generate
    echo ""
    echo "IMPORTANT: Edit .env and fill in:"
    echo "  - DB_USERNAME, DB_PASSWORD"
    echo "  - ADMIN_EMAIL, ADMIN_PASSWORD"
    echo "  - MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD"
    echo "  - REDIS_PASSWORD (if applicable)"
    echo ""
fi

# Verify APP_DEBUG is false in production
if grep -q "APP_DEBUG=true" .env; then
    echo "WARNING: APP_DEBUG=true detected — set to false for production!"
fi

# Run migrations
php artisan migrate --force

# Create storage symlink if missing
if [ ! -L public/storage ]; then
    php artisan storage:link
fi

# Seed admin user (safe — uses updateOrCreate)
php artisan db:seed --class=AdminUserSeeder --force

# Clear old cache and rebuild
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
chmod -R 775 storage bootstrap/cache

echo "Backend ready!"

# ===========================================
# FRONTEND
# ===========================================
echo "Setting up Frontend..."

cd "$APP_DIR"

npm ci --prefer-offline
npm run build

chmod -R 755 dist

echo "Frontend built!"

# ===========================================
# RESTART SERVICES
# ===========================================
echo "Restarting services..."

# Restart PHP-FPM
sudo service php8.2-fpm restart 2>/dev/null \
  || sudo service php8.1-fpm restart 2>/dev/null \
  || true

# Restart Queue Worker (background)
pkill -f "queue:work" || true
sleep 1
cd "$APP_DIR/backend"
nohup php artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 \
  >> storage/logs/queue.log 2>&1 &

echo ""
echo "==================================="
echo "Deployment complete!"
echo "Site : https://saudicareers.site"
echo "Admin: https://saudicareers.site/admin"
echo "API  : https://saudicareers.site/api"
echo "==================================="
