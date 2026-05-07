<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('market_insights', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('output_type'); // linkedin_post / insight / alert / summary
            $table->string('category')->nullable();
            $table->string('sentiment_label')->nullable();
            $table->decimal('sentiment_score', 5, 2)->nullable();
            $table->string('source')->nullable();
            $table->integer('radar_id')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('market_insights');
    }
};
