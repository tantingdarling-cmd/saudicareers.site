<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('browser_fingerprint')->nullable()->index();
            $table->string('ja3_hash')->nullable();
            $table->text('user_agent_raw')->nullable();
            $table->timestamp('last_security_check')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['browser_fingerprint', 'ja3_hash', 'user_agent_raw', 'last_security_check']);
        });
    }
};
