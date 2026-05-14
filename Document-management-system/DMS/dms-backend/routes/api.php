<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\UserController;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::get('/documents/public/{token}', [DocumentController::class, 'publicDownload']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/projects/summary', [ProjectController::class, 'summary']);
        Route::get('/projects/download/{project}', [ProjectController::class, 'download']);
        Route::apiResource('projects', ProjectController::class);
        Route::get('/documents/download/{document}', [DocumentController::class, 'download']);
        Route::post('/documents/bulk', [DocumentController::class, 'bulk']);
        Route::post('/documents/{document}/restore', [DocumentController::class, 'restore']);
        Route::post('/documents/{document}/share', [DocumentController::class, 'share']);
        Route::apiResource('documents', DocumentController::class);
        Route::get('/settings/storage', [SystemSettingController::class, 'showStorage']);
        Route::patch('/settings/storage', [SystemSettingController::class, 'updateStorage']);
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'update', 'destroy', 'show']);

        Route::get('/notifications/{role?}', function (Request $request, ?string $role = null) {
            $authenticatedRole = notification_role_display($request->user()?->role);
            $requestedRole = notification_role_display($role ?? $authenticatedRole);

            if (!$authenticatedRole) {
                return response()->json(['message' => 'Unable to determine user role.'], 422);
            }

            if ($requestedRole !== $authenticatedRole) {
                return response()->json(['message' => 'You are not allowed to view notifications for this role.'], 403);
            }

            return Notification::query()
                ->whereIn('role', notification_role_variants($authenticatedRole))
                ->latest()
                ->get();
        });
    });
});
