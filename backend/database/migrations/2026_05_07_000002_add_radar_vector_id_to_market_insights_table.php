<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('market_insights', function (Blueprint $table) {
            $table->string('radar_vector_id')->nullable()->after('radar_id');
        });
    }

    public function down(): void
    {
        Schema::table('market_insights', function (Blueprint $table) {
            $table->dropColumn('radar_vector_id');
        });
    }
};
