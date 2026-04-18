<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('career_tips', function (Blueprint $table) {
            $table->unsignedTinyInteger('read_time')->nullable()->after('content');
            $table->boolean('is_featured')->default(false)->after('is_published');
        });

        DB::statement("ALTER TABLE career_tips MODIFY COLUMN category ENUM('cv','interview','linkedin','career','salary','skills','fresh_grad') NOT NULL DEFAULT 'career'");
    }

    public function down(): void
    {
        Schema::table('career_tips', function (Blueprint $table) {
            $table->dropColumn(['read_time', 'is_featured']);
        });

        DB::statement("ALTER TABLE career_tips MODIFY COLUMN category ENUM('cv','interview','linkedin','career','salary','skills') NOT NULL DEFAULT 'career'");
    }
};
