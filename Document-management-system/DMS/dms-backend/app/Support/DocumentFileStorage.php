<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentFileStorage
{
    private const BASE_DIRECTORY = 'documents';

    public function storeUploadedFile(UploadedFile $file): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = Str::slug($originalName) ?: 'document';
        $extension = $file->getClientOriginalExtension();
        $filename = $safeName.'-'.Str::random(10).($extension ? '.'.$extension : '');

        return $file->storeAs(self::BASE_DIRECTORY, $filename, 'public');
    }

    public function exists(?string $path): bool
    {
        return $path ? Storage::disk('public')->exists($path) : false;
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public function downloadResponse(string $path, string $downloadName)
    {
        return Storage::disk('public')->download($path, $downloadName);
    }

    public function publicUrl(?string $path): ?string
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }
}
