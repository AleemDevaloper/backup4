<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('original_name');
            $table->string('extension', 20)->nullable();
            $table->string('mime_type')->nullable();
            $table->string('category')->default('FILE');
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->string('path')->nullable();
            $table->string('folder_name')->nullable();
            $table->text('preview_text')->nullable();
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->string('duplicate_hash', 64)->nullable()->index();
            $table->boolean('is_favorite')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_shared')->default(false);
            $table->boolean('in_trash')->default(false);
            $table->timestamp('trashed_at')->nullable();
            $table->string('public_share_token')->nullable()->unique();
            $table->timestamp('public_share_expires_at')->nullable();
            $table->string('public_share_permission')->nullable();
            $table->boolean('allow_public_download')->default(false);
            $table->unsignedInteger('access_count')->default(0);
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('last_opened_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
