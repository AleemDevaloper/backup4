<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'file')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->text('file')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('projects', 'file')) {
            return;
        }

        Schema::table('projects', function (Blueprint $table) {
            $table->string('file')->nullable()->change();
        });
    }
};
