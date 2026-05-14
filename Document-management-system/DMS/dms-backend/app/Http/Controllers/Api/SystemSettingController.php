<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Support\ProjectFileStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function showStorage(ProjectFileStorage $projectFileStorage): JsonResponse
    {
        return response()->json([
            'data' => $projectFileStorage->settingsPayload(),
        ]);
    }

    public function updateStorage(Request $request, ProjectFileStorage $projectFileStorage): JsonResponse
    {
        if ($request->user()?->role !== 'Admin') {
            return response()->json(['message' => 'Only admins can update storage settings.'], 403);
        }

        $data = $request->validate([
            'storagePath' => [
                'required',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, \Closure $fail) use ($projectFileStorage): void {
                    $message = $projectFileStorage->validationMessageForConfiguredPath((string) $value);

                    if ($message) {
                        $fail($message);
                    }
                },
            ],
        ]);

        AppSetting::setValue(
            ProjectFileStorage::STORAGE_PATH_KEY,
            $projectFileStorage->normalizeConfiguredPath($data['storagePath'])
        );

        return response()->json([
            'data' => $projectFileStorage->settingsPayload(),
        ]);
    }
}
