# =============================================
# SaudiCareers.site - Nginx Configuration
# WordPress + Laravel API (Simplified)
# =============================================

server {
    listen 80;
    server_name saudicareers.site www.saudicareers.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saudicareers.site www.saudicareers.site;

    # SSL
    ssl_certificate /etc/letsencrypt/live/saudicareers.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saudicareers.site/privkey.pem;

    # =============================================
    # 1. LARAVEL API - يلتقط /api/* قبل WordPress
    # =============================================
    
    location ^~ /api/ {
        root /var/www/back-end/public;
        index index.php;
        try_files $uri /index.php?$query_string;
    }

    # =============================================
    # 2. WORDPRESS - باقي الطلبات
    # =============================================
    
    root /var/www/html;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # =============================================
    # 3. PHP HANDLER - عام لكل التطبيقات
    # =============================================
    
    location ~ \.php$ {
        try_files $uri =404;
        
        # تحديد المسار حسب أي root تم تطبيقه
        if ($request_uri ~ ^/api/) {
            set $app_root /var/www/back-end/public;
        }
        if ($request_uri !~ ^/api/) {
            set $app_root /var/www/html;
        }
        
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $app_root$fastcgi_script_name;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires max;
        log_not_found off;
    }

    # Security
    location ~ /\.ht {
        deny all;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml text/javascript;
}
