<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('ADMIN_PASSWORD', 'SaudiCareers' . date('Y') . '!@#$');
        
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@saudicareers.site')],
            [
                'name' => env('ADMIN_NAME', 'مدير الموقع'),
                'email' => env('ADMIN_EMAIL', 'admin@saudicareers.site'),
                'password' => Hash::make($password),
                'role' => 'admin',
            ]
        );

        $this->command->info('===========================================');
        $this->command->info('🔐 Admin Account Created/Updated');
        $this->command->info('===========================================');
        $this->command->info('Email:    ' . env('ADMIN_EMAIL', 'admin@saudicareers.site'));
        $this->command->info('Password: ' . $password);
        $this->command->info('');
        $this->command->info('⚠️  IMPORTANT: Change password after first login!');
        $this->command->info('===========================================');
    }
}
