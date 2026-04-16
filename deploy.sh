#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  deploy.sh — سكريبت الإطلاق الآمن | Saudi Careers | Cloudways
#  النسخة: 2.0
#
#  الاستخدام:
#    bash deploy.sh                  # نشر كامل
#    bash deploy.sh --skip-build     # backend فقط (بدون npm build)
#    bash deploy.sh --skip-migrate   # بدون migrate (إصلاح سريع)
#    bash deploy.sh --skip-build --skip-migrate  # cache + queue فقط
#
#  المتطلبات:
#    PHP 8.1+  •  Composer  •  Node 18+  •  npm  •  MySQL متصل
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── الإعدادات ──────────────────────────────────────────────────────────
# Cloudways path — يقرأ من env إذا كان مختلفاً
APP_DIR="${APP_DIR:-$HOME/applications/gaczagbrjk/public_html}"
BACKEND="$APP_DIR/backend"
BRANCH="${BRANCH:-main}"

SKIP_BUILD=false
SKIP_MIGRATE=false
for arg in "$@"; do
  [[ "$arg" == "--skip-build"   ]] && SKIP_BUILD=true
  [[ "$arg" == "--skip-migrate" ]] && SKIP_MIGRATE=true
done

# ── ألوان ──────────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[1;34m'; N='\033[0m'
step()  { echo -e "\n${B}▶ $*${N}"; }
ok()    { echo -e "${G}  ✓ $*${N}"; }
warn()  { echo -e "${Y}  ⚠ $*${N}"; }
abort() { echo -e "${R}  ✖ $*${N}"; exit 1; }

cleanup() {
  [[ $? -ne 0 ]] && abort "فشل عند السطر $LINENO — راجع الخطأ أعلاه"
}
trap cleanup EXIT

# ══════════════════════════════════════════════════════════════════════
echo -e "\n${G}══════════════════════════════════════════════${N}"
echo -e "${G}  🚀  Saudi Careers — الإطلاق الآمن v2.0      ${N}"
echo -e "${G}  $(date '+%Y-%m-%d %H:%M:%S')                  ${N}"
echo -e "${G}══════════════════════════════════════════════${N}"

cd "$APP_DIR" || abort "المسار غير موجود: $APP_DIR"

# ──────────────────────────────────────────────────────────────────────
# 1. Git Pull
# ──────────────────────────────────────────────────────────────────────
step "1/7  Git Pull ($BRANCH)"

git fetch origin
CURRENT=$(git rev-parse --short HEAD)
git pull origin "$BRANCH" --ff-only || abort "git pull فشل — تحقق من conflicts"
NEW=$(git rev-parse --short HEAD)

if [[ "$CURRENT" == "$NEW" ]]; then
  warn "لا كومتات جديدة (HEAD=$CURRENT) — سيُكمَّل النشر رغم ذلك"
fi
ok "HEAD → $NEW  •  $(git log -1 --format='%s')"

# ──────────────────────────────────────────────────────────────────────
# 2. Composer
# ──────────────────────────────────────────────────────────────────────
step "2/7  Composer install"
cd "$BACKEND"

# تهيئة .env عند أول نشر
if [[ ! -f .env ]]; then
  warn "ملف .env غير موجود — نسخ من .env.example"
  cp .env.example .env
  php artisan key:generate --force
fi

# تحذير إذا كان DEBUG مفعّلاً
grep -q "APP_DEBUG=true" .env && warn "APP_DEBUG=true — يُنصح بتغييره لـ false في الإنتاج"

composer install --no-dev --optimize-autoloader --no-interaction --quiet
ok "Composer — vendor optimized"

# ──────────────────────────────────────────────────────────────────────
# 3. Migrations + Seeders
# ──────────────────────────────────────────────────────────────────────
if [[ "$SKIP_MIGRATE" == false ]]; then
  step "3/7  Migrations وSettingsSeeder"

  # اختبار اتصال DB قبل المتابعة
  php artisan db:show --no-interaction > /dev/null 2>&1 \
    || abort "لا يمكن الاتصال بقاعدة البيانات — تحقق من DB_* في .env"

  php artisan migrate --force --no-interaction
  ok "Migrations — تمت"

  # SettingsSeeder يستخدم updateOrInsert → آمن للتكرار
  php artisan db:seed --class=SettingsSeeder --force --no-interaction
  ok "SettingsSeeder — القيم الافتراضية محدّثة"

  # إنشاء symlink للـ Storage إذا لم يكن موجوداً
  [[ ! -L public/storage ]] && php artisan storage:link && ok "storage:link — تم"
else
  warn "3/7  تخطي Migrations (--skip-migrate)"
fi

# ──────────────────────────────────────────────────────────────────────
# 4. Laravel Cache
# ──────────────────────────────────────────────────────────────────────
step "4/7  Laravel Cache"
php artisan config:cache  --no-interaction
php artisan route:cache   --no-interaction
php artisan view:cache    --no-interaction
php artisan event:cache   --no-interaction 2>/dev/null || true  # L10+
ok "config / route / view / event — مكبوتة"

# ──────────────────────────────────────────────────────────────────────
# 5. Frontend Build
# ──────────────────────────────────────────────────────────────────────
if [[ "$SKIP_BUILD" == false ]]; then
  step "5/7  Frontend Build (Vite)"
  cd "$APP_DIR"

  npm ci --prefer-offline --silent
  ok "npm ci — الحزم جاهزة"

  NODE_ENV=production npm run build
  ok "Vite build — اكتمل  •  dist/$(du -sh dist/assets 2>/dev/null | cut -f1) assets"

  # ── نشر آمن شبه-ذري ──────────────────────────────────────────────
  step "6/7  نشر Assets (شبه-ذري)"

  # 1. انسخ الـ assets الجديدة إلى مجلد مؤقت
  cp -r dist/assets assets_new

  # 2. تبديل سريع (الجديدة أولاً، ثم index.html)
  [[ -d assets ]] && mv assets assets_old
  mv assets_new assets
  cp dist/index.html index.html
  chmod -R 755 assets

  # 3. نسخ الملفات الثابتة إن وُجدت في dist
  for f in dist/*.txt dist/*.xml dist/*.svg dist/*.png dist/*.ico dist/*.webmanifest; do
    [[ -f "$f" ]] && cp "$f" ./ && ok "  نُسخ: $(basename "$f")"
  done

  # 4. حذف القديمة — بعد تأكيد نجاح النشر
  rm -rf assets_old 2>/dev/null || true
  ok "Assets — منشورة بنجاح"
else
  warn "5/7, 6/7  تخطي Build وAssets (--skip-build)"
fi

# ──────────────────────────────────────────────────────────────────────
# 7. Queue Workers
# ──────────────────────────────────────────────────────────────────────
step "7/7  Queue Workers"
cd "$BACKEND"

# queue:restart يبلّغ Workers الحالية بإعادة التشغيل عند انتهاء مهمتها (graceful)
php artisan queue:restart --no-interaction
ok "queue:restart — Workers ستُعيد التشغيل تلقائياً"

# هل يعمل Supervisor؟
if command -v supervisorctl &>/dev/null; then
  supervisorctl reread  > /dev/null 2>&1 || true
  supervisorctl update  > /dev/null 2>&1 || true
  supervisorctl restart saudicareers-queue > /dev/null 2>&1 \
    && ok "Supervisor — saudicareers-queue أُعيد تشغيله" \
    || warn "Supervisor — البرنامج غير موجود، راجع /etc/supervisor/conf.d/"
elif pgrep -f "queue:work" > /dev/null; then
  ok "queue:work يعمل بالفعل (سيقرأ إشارة restart عند انتهاء المهمة الحالية)"
else
  warn "لا يوجد queue:work يعمل — سيتم إطلاقه الآن بـ nohup"
  nohup php artisan queue:work redis \
    --queue=notifications,default \
    --sleep=3 \
    --tries=3 \
    --max-time=3600 \
    >> storage/logs/queue.log 2>&1 &
  ok "queue:work بدأ (PID $!) — يتابع في storage/logs/queue.log"
fi

# ── التحقق النهائي ─────────────────────────────────────────────────────
echo ""
[[ -f "$APP_DIR/index.html"       ]] && ok "index.html"        || warn "MISSING: index.html"
[[ -d "$APP_DIR/assets"           ]] && ok "assets/"           || warn "MISSING: assets/"
[[ -f "$BACKEND/public/index.php" ]] && ok "Laravel API"       || warn "MISSING: backend/public/index.php"
[[ -f "$BACKEND/bootstrap/cache/config.php" ]] && ok "config cache" || warn "config cache مفقود"

# ── فحص REACT_INDEX_PATH ───────────────────────────────────────────────
REACT_INDEX=$(cd "$BACKEND" && php artisan tinker --execute="echo config('app.react_index_path');" 2>/dev/null || true)
if [[ -f "${REACT_INDEX:-}" ]]; then
  ok "REACT_INDEX_PATH → $REACT_INDEX"
else
  warn "REACT_INDEX_PATH غير صحيح أو غير محدد في .env"
  warn "  أضف: REACT_INDEX_PATH=$APP_DIR/index.html"
fi

# ── فحص خط Noto Arabic ─────────────────────────────────────────────────
FONT_PATH="$BACKEND/resources/fonts/NotoSansArabic-Regular.ttf"
if [[ -f "$FONT_PATH" ]]; then
  FONT_SIZE=$(du -h "$FONT_PATH" | cut -f1)
  ok "NotoSansArabic-Regular.ttf ($FONT_SIZE) — صور OG بعربية كاملة"
else
  warn "خط Noto Arabic غير موجود — صور OG ستعمل بـ fallback"
  warn "  لتفعيله:"
  warn "  1. نزّل: https://fonts.google.com/noto/specimen/Noto+Sans+Arabic"
  warn "  2. ضع الملفين في: $BACKEND/resources/fonts/"
  warn "     NotoSansArabic-Regular.ttf"
  warn "     NotoSansArabic-Bold.ttf"
fi

# ── فحص GD Extension ───────────────────────────────────────────────────
php -r "echo extension_loaded('gd') ? 'ok' : 'missing';" 2>/dev/null | grep -q "ok" \
  && ok "PHP GD — OG image generator جاهز" \
  || warn "PHP GD غير مفعّل — تفعيله في php.ini: extension=gd"

# ══════════════════════════════════════════════════════════════════════
echo -e "\n${G}══════════════════════════════════════════════${N}"
echo -e "${G}  ✅  تم الإطلاق بنجاح!                       ${N}"
echo -e "${G}  الإصدار : $NEW — $(git -C "$APP_DIR" log -1 --format='%s')${N}"
echo -e "${G}  الموقع  : https://saudicareers.site           ${N}"
echo -e "${G}  الإدارة : https://saudicareers.site/admin     ${N}"
echo -e "${G}  الوقت   : $(date '+%H:%M:%S')                 ${N}"
echo -e "${G}══════════════════════════════════════════════${N}\n"

# ══════════════════════════════════════════════════════════════════════
# ملف Supervisor المقترح:
# احفظه في: /etc/supervisor/conf.d/saudicareers-queue.conf
# ثم نفّذ: supervisorctl reread && supervisorctl update
# ══════════════════════════════════════════════════════════════════════
# [program:saudicareers-queue]
# command=php /home/master/applications/gaczagbrjk/public_html/backend/artisan
#         queue:work redis --queue=notifications,default --sleep=3 --tries=3 --max-time=3600
# directory=/home/master/applications/gaczagbrjk/public_html/backend
# user=master
# numprocs=2
# process_name=%(program_name)s_%(process_num)02d
# autostart=true
# autorestart=true
# stopwaitsecs=60
# stderr_logfile=/var/log/saudicareers-queue.err.log
# stdout_logfile=/var/log/saudicareers-queue.out.log
