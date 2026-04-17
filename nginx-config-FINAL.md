# =============================================
# SaudiCareers.site - Nginx Configuration
# WordPress + Laravel API
# =============================================

server {
    listen 80;
    server_name saudicareers.site www.saudi careers.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saudicareers.site www.saudicareers.site;

    # SSL
    ssl_certificate /etc/letsencrypt/live/saudicareers.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saudicareers.site/privkey.pem;

    # =============================================
    # 1. LARAVEL API - PRIORITY HIGHEST
    # ^~ يمنع أي regex location من تجاوزه
    # =============================================
    location ^~ /api/ {
        root /var/www/back-end/public;
        index index.php;

        try_files $uri /index.php?$query_string;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        }
    }

    # Sanctum routes
    location ^~ /sanctum/ {
        root /var/www/back-end/public;
        index index.php;

        try_files $uri /index.php?$query_string;

        location ~ \.php$ {
            include fastcgi_params;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        }
    }

    # =============================================
    # 2. WORDPRESS - بعد Laravel مباشرة
    # =============================================
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|html)$ {
        root /var/www/html;
        expires max;
        log_not_found off;
        access_log off;
    }

    # WordPress root
    location / {
        root /var/www/html;
        index index.php;
        try_files $uri $uri/ /index.php?$args;
    }

    # WordPress PHP
    location ~ \.php$ {
        root /var/www/html;
        try_files $uri =404;
        fastcgi_split_path_info ^(/wp-content)(/.*)?$;
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # WordPress security
    location ~ /\.ht {
        deny all;
    }

    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
