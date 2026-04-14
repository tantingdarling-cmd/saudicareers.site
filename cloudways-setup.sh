#!/bin/bash
# =============================================
# SaudiCareers - Laravel Setup (Cloudways)
# Run without sudo
# =============================================

cd ~/applications/gaczagbrjk/public_html/backend

echo "📁 Working in: $(pwd)"

# =============================================
# 1. Create .env
# =============================================
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
else
    echo "✅ .env exists"
fi

# =============================================
# 2. Basic Config
# =============================================
echo "⚙️  Configuring basic settings..."

# Update basic values
sed -i 's|APP_ENV=.*|APP_ENV=production|' .env
sed -i 's|APP_DEBUG=.*|APP_DEBUG=true|' .env
sed -i 's|APP_URL=.*|APP_URL=https://saudicareers.site|' .env

echo "   ✅ Basic config done"
echo ""
echo "⚠️  IMPORTANT: Edit .env and add DB credentials:"
echo "   DB_HOST=your_cloudways_db_host"
echo "   DB_PORT=3306"
echo "   DB_DATABASE=saudicareers"
echo "   DB_USERNAME=your_db_user"
echo "   DB_PASSWORD=your_db_password"

# =============================================
# 3. Permissions
# =============================================
echo ""
echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache
chmod -R 775 storage/logs
echo "   ✅ Permissions set (775)"

# =============================================
# 4. Composer Install
# =============================================
echo ""
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader --prefer-dist
echo "   ✅ Dependencies installed"

# =============================================
# 5. Generate Key
# =============================================
echo ""
echo "🔑 Generating APP_KEY..."
php artisan key:generate --force
echo "   ✅ APP_KEY generated"

# =============================================
# 6. Clear Caches
# =============================================
echo ""
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "   ✅ Caches cleared"

# =============================================
# 7. Cache Configs (optional for production)
# =============================================
echo ""
echo "💾 Caching configs..."
php artisan config:cache
php artisan route:cache
echo "   ✅ Configs cached"

# =============================================
# 8. Storage Link
# =============================================
echo ""
echo "🔗 Creating storage link..."
php artisan storage:link 2>/dev/null || echo "   (already exists)"

# =============================================
# 9. Migration
# =============================================
echo ""
echo "🗄️  Running migrations..."
echo "   ⚠️  Only works if DB is configured in .env"
php artisan migrate --force

# =============================================
# 10. Seed Data
# =============================================
echo ""
echo "🌱 Seeding database..."
php artisan db:seed --force

# =============================================
# 11. Create Admin User
# =============================================
echo ""
echo "👤 Creating admin user..."
php artisan db:seed --class=AdminUserSeeder --force

# =============================================
# 12. Check Logs
# =============================================
echo ""
echo "📋 Last 20 lines from Laravel log:"
if [ -f storage/logs/laravel.log ]; then
    tail -20 storage/logs/laravel.log
else
    echo "   No log file yet"
fi

# =============================================
# DONE
# =============================================
echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env with DB credentials (if not done)"
echo "2. Run: php artisan migrate"
echo "3. Test API: curl https://saudicareers.site/api/v1/jobs"
echo ""
echo "View logs: tail -f storage/logs/laravel.log"
echo "=========================================="
