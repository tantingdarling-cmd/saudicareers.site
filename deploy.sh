#!/bin/bash
# ===========================================
# SaudiCareers Deployment Script
# Run on Cloudways Server
# ===========================================

set -e

echo "🚀 Starting deployment for saudicareers.site..."

# Navigate to app directory
cd /var/www/saudicareers

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# ===========================================
# BACKEND
# ===========================================
echo "⚙️  Setting up Backend..."

cd /var/www/saudicareers/backend

# Install dependencies
composer install --no-dev --optimize-autoloader --prefer-dist

# Environment setup
if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate
fi

# Run migrations
php artisan migrate --force

# Seed data
php artisan db:seed --force

# Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
chmod -R 775 storage bootstrap/cache

echo "✅ Backend ready!"

# ===========================================
# FRONTEND
# ===========================================
echo "⚙️  Setting up Frontend..."

cd /var/www/saudicareers

# Build React app
npm install
npm run build

# Set permissions
chmod -R 775 dist

echo "✅ Frontend built!"

# ===========================================
# RESTART SERVICES
# ===========================================
echo "🔄 Restarting services..."

# Restart PHP-FPM
sudo service php8.2-fpm restart 2>/dev/null || sudo service php8.1-fpm restart 2>/dev/null || true

# Restart Queue Worker
pkill -f "queue:work" || true
cd /var/www/saudicareers/backend
php artisan queue:work redis --sleep=3 --tries=3 &

echo ""
echo "==================================="
echo "🎉 Deployment complete!"
echo "🌐 Site: https://saudicareers.site"
echo "📊 API: https://saudicareers.site/api"
echo "==================================="
