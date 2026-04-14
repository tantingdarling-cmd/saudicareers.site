#!/bin/bash

echo "=============================================="
echo "SaudiCareers - Laravel Quick Setup"
echo "=============================================="

echo ""
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --prefer-dist

echo ""
echo "🔑 Generating APP_KEY..."
php artisan key:generate --force

echo ""
echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 storage/logs

echo ""
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "💾 Caching configs..."
php artisan config:cache
php artisan route:cache

echo ""
echo "🔗 Creating storage link..."
php artisan storage:link 2>/dev/null || true

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "Next: Edit .env with DB credentials"
echo "Then run: php artisan migrate --force"
echo "=============================================="
