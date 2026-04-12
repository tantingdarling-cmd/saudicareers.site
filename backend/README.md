# SaudiCareers Backend API

## Requirements
- PHP 8.1+
- Composer 2+
- MySQL 8.0+
- Redis (optional)

## Installation

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database
mysql -u root -p
CREATE DATABASE saudicareers;
exit;

# Run migrations
php artisan migrate

# Seed sample data (optional)
php artisan db:seed

# Start development server
php artisan serve
```

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/jobs` | List all jobs |
| GET | `/api/v1/jobs/featured` | List featured jobs |
| GET | `/api/v1/jobs/{id}` | Get job details |
| POST | `/api/v1/applications` | Submit job application |
| GET | `/api/v1/tips` | List career tips |
| GET | `/api/v1/tips/{slug}` | Get tip details |
| POST | `/api/v1/subscribe` | Subscribe to newsletter |

### Admin (requires Sanctum token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/jobs` | Create job |
| PUT | `/api/admin/jobs/{id}` | Update job |
| DELETE | `/api/admin/jobs/{id}` | Delete job |
| GET | `/api/admin/applications` | List all applications |
| PATCH | `/api/admin/applications/{id}/status` | Update application status |
| GET | `/api/admin/subscribers` | List subscribers |

## Authentication

```bash
# Create admin user
php artisan tinker
>>> \App\Models\User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password')]);

# Get token
curl -X POST http://localhost:8000/api/sanctum/token \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password","device_name":"admin"}'
```

## Production Deployment

```bash
# Build optimized
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
```
