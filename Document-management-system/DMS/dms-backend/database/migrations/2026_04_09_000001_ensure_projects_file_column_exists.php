<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'file')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->string('file')->nullable()->after('team_size');
            });
        }
    }

    public function down(): void
    {
        // Intentionally left blank to avoid dropping a valid file column on rollback.
    }
};
