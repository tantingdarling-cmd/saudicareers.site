# 🚀 دليل نشر SaudiCareers على Cloudways

## هيكل المشروع

```
saudicareers#2/
├── frontend/          # React (Vite)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── composer.json
│   └── .env.example
└── DEPLOYMENT_GUIDE.md  # هذا الملف
```

---

## الخطوة 1: إعداد الخادم على Cloudways

### 1.1 إنشاء Server جديد
1. سجل دخول إلى [Cloudways](https://console.cloudways.com)
2. اضغط **Add Server**
3. اختر:
   - **Cloud**: AWS / DigitalOcean / Google Cloud
   - **Server Size**: 2GB RAM+
   - **Region**: Singapore أو Frankfurt (الأقرب للسعودية)
   - **Application Name**: `saudicareers`

### 1.2 تثبيت Laravel
1. من لوحة تحكم Cloudways، اضغط **Applications**
2. اختر التطبيق > **Add Application**
3. اختر **PHP Stack** أو **Laravel**
4. **Git Clone**: رابط مستودع GitHub الخاص بك

---

## الخطوة 2: إعداد قاعدة البيانات

### 2.1 إنشاء Database
1. من Cloudways Console:
   - اذهب إلى **Database**
   - اضغط **Add Database**
   - اسم: `saudicareers`
   - **Master Credentials**: انسخ البيانات

### 2.2 بيانات الاتصال
```
DB_HOST: server-ip
DB_PORT: 3306
DB_DATABASE: saudicareers
DB_USERNAME: db_user (من Cloudways)
DB_PASSWORD: db_password (من Cloudways)
```

---

## الخطوة 3: رفع الملفات

### 3.1 عبر Git (ال推荐)
```bash
# من جهازك
git remote add production ssh://user@server-ip:22/var/www/saudicareers

# ارفع Backend
cd backend
git add .
git commit -m "Add Laravel API"
git push production main

# ارفع Frontend
cd ../frontend
git add .
git commit -m "Add React frontend"
git push production main
```

### 3.2 عبر SFTP
```
Host: server-ip
Username: cloudways
Password: **** (من Cloudways)
Port: 22
Path: /var/www/saudicareers
```

---

## الخطوة 4: إعداد Backend (Laravel)

### 4.1 تثبيت Dependencies
```bash
cd /var/www/saudicareers/backend

composer install --no-dev --optimize-autoloader
```

### 4.2 نسخ Environment
```bash
cp .env.example .env
```

### 4.3 تحديث .env
```bash
nano .env
```

```env
APP_NAME="SaudiCareers"
APP_ENV=production
APP_KEY=  # شغّل php artisan key:generate
APP_DEBUG=false
APP_URL=https://saudicareers.site

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saudicareers
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 4.4 تشغيل الأوامر
```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

### 4.5 إعداد Nginx
```bash
# افتح إعدادات Nginx
nano /var/www/saudicareers/backend/nginx.conf
```

أو من Cloudways Console > Application Settings > Vhost Config:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
}
```

---

## الخطوة 5: إعداد Frontend (React)

### 5.1 تثبيت Dependencies
```bash
cd /var/www/saudicareers/frontend
npm install
npm run build
```

### 5.2 تحديث Environment
```bash
nano .env.production
```

```env
VITE_API_URL=https://saudicareers.site/api
```

### 5.3 إعداد Vite Config
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

---

## الخطوة 6: إعداد Domain

### 6.1 إضافة Domain في Cloudways
1. **Settings & Packages** > **Domain Management**
2. أضف: `saudicareers.site` و `www.saudicareers.site`
3. أضف DNS Record:
   ```
   Type: A
   Name: @
   Value: server-ip
   ```

### 6.2 SSL Certificate
1. **SSL Certificate** > **Let's Encrypt**
2. أدخل الإيميل واسم الدومين
3. اضغط **Install**

---

## الخطوة 7: إعداد Queue Worker (للإشعارات)

```bash
# تشغيل Queue Worker
cd /var/www/saudicareers/backend
php artisan queue:work redis --sleep=3 --tries=3 &
```

### إعداد Cron
```bash
# من Cloudways Console
# أضف Cron Job:
* * * * * cd /var/www/saudicareers/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## الخطوة 8: إعداد CORS

### في Laravel (.env)
```env
CORS_ALLOWED_ORIGINS=https://saudicareers.site,https://www.saudicareers.site
```

### في config/cors.php
```php
'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),
```

---

## الأوامر المهمة

```bash
# تحديث الكود
cd /var/www/saudicareers
git pull origin main

# Backend
cd backend
composer install
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Frontend
cd ../frontend
npm install
npm run build

# إعادة تشغيل PHP
sudo service php8.2-fpm restart
```

---

## استكشاف الأخطاء

### خطأ 500
```bash
# تحقق من Laravel logs
tail -f backend/storage/logs/laravel.log

# تحقق من permissions
chmod -R 755 backend/storage
chmod -R 755 backend/bootstrap/cache
```

### خطأ API 404
```bash
# تحقق من route
php artisan route:list
```

### خطأ Database
```bash
# تحقق من الاتصال
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## ملاحظات الأمان

1. ✅ غيّر `APP_KEY` بشكل دوري
2. ✅ فعّل `APP_DEBUG=false` في الإنتاج
3. ✅ استخدم HTTPS فقط
4. ✅ لا تحفظ كلمات المرور في Git
5. ✅ راجع `storage/logs` بانتظام

---

## الدعم

- Cloudways Docs: https://support.cloudways.com
- Laravel Docs: https://laravel.com/docs
- React Docs: https://react.dev
