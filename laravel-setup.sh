#!/bin/bash
# =============================================
# SaudiCareers - Laravel Setup Script
# Run on Cloudways Server
# =============================================

set -e

echo "🚀 Starting Laravel Setup..."

# Navigate to backend
cd /home/master/applications/public_html/backend

echo "📁 Current directory: $(pwd)"

# =============================================
# 1. CHECK .env
# =============================================
echo ""
echo "1️⃣  Checking .env file..."

if [ ! -f .env ]; then
    echo "   ⚠️  .env not found, creating from .env.example..."
    cp .env.example .env
else
    echo "   ✅ .env exists"
fi

# =============================================
# 2. CONFIGURE .env
# =============================================
echo ""
echo "2️⃣  Configuring .env..."

# Update .env values
sed -i 's/APP_ENV=local/APP_ENV=production/' .env 2>/dev/null || true
sed -i 's/APP_DEBUG=true/APP_DEBUG=true/' .env 2>/dev/null || true
sed -i "s|APP_URL=.*|APP_URL=https://saudicareers.site|" .env 2>/dev/null || true

# Add database values from Cloudways (fill these manually or from Cloudways panel)
# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD

echo "   ✅ .env configured"
echo ""
echo "   ⚠️  IMPORTANT: Edit .env and set your database credentials:"
echo "      DB_HOST=your_cloudways_db_host"
echo "      DB_PORT=3306"
echo "      DB_DATABASE=saudicareers"
echo "      DB_USERNAME=your_db_user"
echo "      DB_PASSWORD=your_db_password"

# =============================================
# 3. PERMISSIONS
# =============================================
echo ""
echo "3️⃣  Setting permissions..."

chmod -R 775 storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache
chmod -R 775 storage/logs 2>/dev/null || chmod -R 777 storage/logs

echo "   ✅ Permissions set (775 for storage and bootstrap/cache)"

# =============================================
# 4. PHP VERSION CHECK
# =============================================
echo ""
echo "4️⃣  PHP Version: $(php -v | head -1)"

# =============================================
# 5. COMPOSER INSTALL
# =============================================
echo ""
echo "5️⃣  Installing Composer dependencies..."

composer install --no-dev --optimize-autoloader --prefer-dist

echo "   ✅ Composer dependencies installed"

# =============================================
# 6. LARAVEL COMMANDS
# =============================================
echo ""
echo "6️⃣  Running Laravel commands..."

echo "   - Generating APP_KEY..."
php artisan key:generate --force

echo "   - Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

echo "   - Caching configs..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "   ✅ Laravel commands completed"

# =============================================
# 7. STORAGE LINK
# =============================================
echo ""
echo "7️⃣  Creating storage link..."
php artisan storage:link 2>/dev/null || echo "   ⚠️  Storage link may already exist"

# =============================================
# 8. CHECK LOGS
# =============================================
echo ""
echo "8️⃣  Checking Laravel logs..."

if [ -f storage/logs/laravel.log ]; then
    echo "   Last 10 lines from log:"
    tail -10 storage/logs/laravel.log
else
    echo "   ⚠️  No log file found yet (will be created on first error)"
fi

# =============================================
# 9. MIGRATIONS (if DB is configured)
# =============================================
echo ""
echo "9️⃣  Running migrations..."
echo "   ⚠️  Only run if database is configured in .env"
echo "   Run manually: php artisan migrate"

# =============================================
# FINAL
# =============================================
echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Run: php artisan migrate"
echo "3. Run: php artisan db:seed"
echo "4. Test: curl https://saudicareers.site/api/v1/jobs"
echo ""
echo "Check logs: tail -f storage/logs/laravel.log"
echo "============================================"
