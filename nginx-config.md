# =============================================
# SaudiCareers.site - Nginx Configuration
# WordPress + Laravel API
# =============================================

# Main Server Block
server {
    listen 80;
    listen [::]:80;
    server_name saudicareers.site www.saudicareers.site;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name saudicareers.site www.saudi careers.site;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saudicareers.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saudicareers.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Root directory (WordPress)
    root /var/www/html;
    index index.php index.html;

    # =============================================
    # LARAVEL API - يجب أن يكون قبل WordPress blocks
    # =============================================
    location /api/ {
        alias /var/www/back-end/public/;
        try_files $uri $uri/ /api/index.php?$query_string;

        # PHP-FPM for Laravel
        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_split_path_info ^/api(/)(.+)$;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/back-end/public/index.php;
            fastcgi_param PATH_INFO $fastcgi_path_info;
            fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
        }
    }

    # =============================================
    # LARAVEL SANCTUM CSRF & OTHER ROUTES
    # =============================================
    location /sanctum/ {
        alias /var/www/back-end/public/;
        try_files $uri $uri/ /sanctum/index.php?$query_string;

        location ~ \.php$ {
            try_files $uri =404;
            fastcgi_split_path_info ^/sanctum(/)(.+)$;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/back-end/public/index.php;
            fastcgi_param PATH_INFO $fastcgi_path_info;
        }
    }

    # =============================================
    # WORDPRESS - كل شيء آخر
    # =============================================
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # WordPress PHP processing
    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(/wp-content)(/.*)?$;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
    }

    # WordPress specific locations
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires max;
        log_not_found off;
        access_log off;
    }

    # WordPress security - deny access to sensitive files
    location ~ /\.(?!well-known) {
        deny all;
    }

    location ~* /(?:uploads|files)/.*\.php$ {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
