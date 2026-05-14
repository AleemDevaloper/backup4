<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentActivity;
use App\Models\DocumentShare;
use App\Models\DocumentVersion;
use App\Support\DocumentFileStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    private const NOTIFICATION_ROLES = ['Admin', 'CEO', 'Project Manager', 'Simple User'];
    private const STORAGE_LIMIT_BYTES = 1073741824;

    public function index(Request $request): JsonResponse
    {
        $query = Document::query()->with(['owner', 'shares', 'versions', 'activities.user'])->latest('updated_at');

        if ($search = trim((string) $request->string('search'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('original_name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            match ($category) {
                'shared' => $query->where('is_shared', true)->where('in_trash', false),
                'favorites' => $query->where('is_favorite', true)->where('in_trash', false),
                'trash' => $query->where('in_trash', true),
                'pinned' => $query->where('is_pinned', true)->where('in_trash', false),
                default => $query->where('in_trash', false),
            };
        }

        if ($type = $request->input('type')) {
            $query->where('category', strtoupper((string) $type));
        }

        if ($dateFrom = $request->input('dateFrom')) {
            $query->whereDate('updated_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('dateTo')) {
            $query->whereDate('updated_at', '<=', $dateTo);
        }

        if ($minSize = $request->input('minSize')) {
            $query->where('size_bytes', '>=', (int) $minSize);
        }

        if ($maxSize = $request->input('maxSize')) {
            $query->where('size_bytes', '<=', (int) $maxSize);
        }

        $documents = $query->get();

        return response()->json([
            'data' => $documents->map(fn (Document $document) => $this->documentPayload($document))->values(),
            'meta' => $this->metaPayload($request->user()?->id),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:15360'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'folderName' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable'],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $hash = hash_file('sha1', $file->getRealPath());
        $storedPath = $this->storage()->storeUploadedFile($file);
        $displayName = $data['name'] ?? $file->getClientOriginalName();
        $tags = $this->normalizeTags($request->input('tags'));

        $document = Document::create([
            'user_id' => $request->user()?->id,
            'name' => $displayName,
            'original_name' => $file->getClientOriginalName(),
            'extension' => strtolower((string) $file->getClientOriginalExtension()),
            'mime_type' => $file->getMimeType(),
            'category' => $this->categorize($file->getClientOriginalExtension(), $file->getMimeType()),
            'size_bytes' => $file->getSize(),
            'path' => $storedPath,
            'folder_name' => $data['folderName'] ?? null,
            'preview_text' => $this->previewTextFor($displayName),
            'description' => $data['description'] ?? null,
            'tags' => $tags,
            'duplicate_hash' => $hash,
            'is_shared' => false,
            'in_trash' => false,
        ]);

        $this->createVersion($document, $file, $storedPath, $request->user()?->id, 'Initial upload');
        $this->logActivity($document, $request, 'uploaded', sprintf('%s uploaded %s.', $this->actorName($request), $document->name));

        $duplicates = Document::query()
            ->where('duplicate_hash', $hash)
            ->where('id', '!=', $document->id)
            ->count();

        if ($duplicates > 0) {
            $this->logActivity($document, $request, 'duplicate-detected', sprintf('Duplicate detected for %s.', $document->name), [
                'duplicateCount' => $duplicates,
            ]);
        }

        notify(
            'Document Uploaded',
            sprintf('%s uploaded document "%s".', $this->actorRole($request), $document->name),
            self::NOTIFICATION_ROLES
        );

        return response()->json(['data' => $this->documentPayload($document->fresh(['owner', 'shares', 'versions', 'activities.user']))], 201);
    }

    public function show(Request $request, Document $document): JsonResponse
    {
        $document->increment('access_count');
        $document->forceFill(['last_opened_at' => now()])->save();

        $this->logActivity($document, $request, 'opened', sprintf('%s opened %s.', $this->actorName($request), $document->name));

        return response()->json([
            'data' => $this->documentPayload($document->fresh(['owner', 'shares', 'versions', 'activities.user'])),
        ]);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'folderName' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable'],
            'isFavorite' => ['nullable', 'boolean'],
            'isPinned' => ['nullable', 'boolean'],
            'isShared' => ['nullable', 'boolean'],
            'inTrash' => ['nullable', 'boolean'],
            'publicShareExpiresAt' => ['nullable', 'date'],
            'allowPublicDownload' => ['nullable', 'boolean'],
            'file' => ['nullable', 'file', 'max:15360'],
        ]);

        if (array_key_exists('name', $data)) {
            $document->name = $data['name'] ?: $document->name;
        }

        if (array_key_exists('description', $data)) {
            $document->description = $data['description'];
        }

        if (array_key_exists('folderName', $data)) {
            $document->folder_name = $data['folderName'];
        }

        if ($request->has('tags')) {
            $document->tags = $this->normalizeTags($request->input('tags'));
        }

        if (array_key_exists('isFavorite', $data)) {
            $document->is_favorite = (bool) $data['isFavorite'];
        }

        if (array_key_exists('isPinned', $data)) {
            $document->is_pinned = (bool) $data['isPinned'];
        }

        if (array_key_exists('isShared', $data)) {
            $document->is_shared = (bool) $data['isShared'];
        }

        if (array_key_exists('inTrash', $data)) {
            $document->in_trash = (bool) $data['inTrash'];
            $document->trashed_at = $document->in_trash ? now() : null;
        }

        if (array_key_exists('publicShareExpiresAt', $data)) {
            $document->public_share_expires_at = $data['publicShareExpiresAt'];
        }

        if (array_key_exists('allowPublicDownload', $data)) {
            $document->allow_public_download = (bool) $data['allowPublicDownload'];
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            if ($document->path) {
                $this->storage()->delete($document->path);
            }

            $storedPath = $this->storage()->storeUploadedFile($file);
            $document->path = $storedPath;
            $document->original_name = $file->getClientOriginalName();
            $document->extension = strtolower((string) $file->getClientOriginalExtension());
            $document->mime_type = $file->getMimeType();
            $document->category = $this->categorize($file->getClientOriginalExtension(), $file->getMimeType());
            $document->size_bytes = $file->getSize();
            $document->duplicate_hash = hash_file('sha1', $file->getRealPath());

            $this->createVersion(
                $document,
                $file,
                $storedPath,
                $request->user()?->id,
                'Document file replaced'
            );
        }

        $document->save();

        $this->logActivity($document, $request, 'updated', sprintf('%s updated %s.', $this->actorName($request), $document->name));

        return response()->json([
            'data' => $this->documentPayload($document->fresh(['owner', 'shares', 'versions', 'activities.user'])),
        ]);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        $force = $request->boolean('force');

        if (!$force && !$document->in_trash) {
            $document->forceFill([
                'in_trash' => true,
                'trashed_at' => now(),
            ])->save();

            $this->logActivity($document, $request, 'trashed', sprintf('%s moved %s to trash.', $this->actorName($request), $document->name));

            return response()->json(['ok' => true, 'mode' => 'trashed']);
        }

        foreach ($document->versions as $version) {
            $this->storage()->delete($version->path);
        }

        $this->storage()->delete($document->path);
        $document->delete();

        $this->logActivity(null, $request, 'deleted', sprintf('%s permanently deleted %s.', $this->actorName($request), $document->name), [
            'documentName' => $document->name,
        ]);

        return response()->json(['ok' => true, 'mode' => 'deleted']);
    }

    public function restore(Request $request, Document $document): JsonResponse
    {
        $document->forceFill([
            'in_trash' => false,
            'trashed_at' => null,
        ])->save();

        $this->logActivity($document, $request, 'restored', sprintf('%s restored %s.', $this->actorName($request), $document->name));

        return response()->json(['data' => $this->documentPayload($document->fresh(['owner', 'shares', 'versions', 'activities.user']))]);
    }

    public function bulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'action' => ['required', 'string'],
        ]);

        $documents = Document::query()->whereIn('id', $data['ids'])->get();

        foreach ($documents as $document) {
            match ($data['action']) {
                'trash' => $document->forceFill(['in_trash' => true, 'trashed_at' => now()])->save(),
                'restore' => $document->forceFill(['in_trash' => false, 'trashed_at' => null])->save(),
                'favorite' => $document->forceFill(['is_favorite' => true])->save(),
                'unfavorite' => $document->forceFill(['is_favorite' => false])->save(),
                'pin' => $document->forceFill(['is_pinned' => true])->save(),
                'unpin' => $document->forceFill(['is_pinned' => false])->save(),
                default => null,
            };
        }

        $this->logActivity(null, $request, 'bulk-'.$data['action'], sprintf('%s ran bulk action %s on %d documents.', $this->actorName($request), $data['action'], $documents->count()));

        return response()->json(['ok' => true]);
    }

    public function share(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'recipient' => ['nullable', 'string', 'max:255'],
            'permission' => ['nullable', 'string', 'in:view,edit,download'],
            'expiresInDays' => ['nullable', 'integer', 'min:1', 'max:365'],
            'isPublic' => ['nullable', 'boolean'],
            'allowDownload' => ['nullable', 'boolean'],
        ]);

        $isPublic = (bool) ($data['isPublic'] ?? false);
        $permission = $data['permission'] ?? 'view';
        $expiresAt = !empty($data['expiresInDays']) ? now()->addDays((int) $data['expiresInDays']) : null;

        $share = DocumentShare::create([
            'document_id' => $document->id,
            'shared_by' => $request->user()?->id,
            'recipient' => $data['recipient'] ?? null,
            'permission' => $permission,
            'share_type' => $isPublic ? 'public' : 'internal',
            'token' => $isPublic ? Str::random(32) : null,
            'expires_at' => $expiresAt,
            'allow_download' => (bool) ($data['allowDownload'] ?? false),
        ]);

        if ($isPublic) {
            $document->forceFill([
                'public_share_token' => $share->token,
                'public_share_expires_at' => $share->expires_at,
                'public_share_permission' => $permission,
                'allow_public_download' => $share->allow_download,
                'is_shared' => true,
            ])->save();
        } else {
            $document->forceFill(['is_shared' => true])->save();
        }

        $this->logActivity($document, $request, 'shared', sprintf('%s shared %s.', $this->actorName($request), $document->name), [
            'recipient' => $share->recipient,
            'permission' => $share->permission,
            'shareType' => $share->share_type,
        ]);

        notify(
            'Document Shared',
            sprintf('%s shared document "%s".', $this->actorRole($request), $document->name),
            self::NOTIFICATION_ROLES
        );

        return response()->json([
            'data' => [
                'share' => $this->sharePayload($share),
                'document' => $this->documentPayload($document->fresh(['owner', 'shares', 'versions', 'activities.user'])),
            ],
        ]);
    }

    public function download(Request $request, Document $document)
    {
        if (!$document->path || !$this->storage()->exists($document->path)) {
            return response()->json(['message' => 'Document file not found.'], 404);
        }

        $document->increment('download_count');
        $this->logActivity($document, $request, 'downloaded', sprintf('%s downloaded %s.', $this->actorName($request), $document->name));

        return $this->storage()->downloadResponse($document->path, $document->original_name ?: $document->name);
    }

    public function publicDownload(string $token)
    {
        $document = Document::query()->where('public_share_token', $token)->first();

        if (!$document || !$document->path || !$this->storage()->exists($document->path)) {
            return response()->json(['message' => 'Public document link is invalid.'], 404);
        }

        if ($document->public_share_expires_at && now()->greaterThan($document->public_share_expires_at)) {
            return response()->json(['message' => 'This public link has expired.'], 410);
        }

        if (!$document->allow_public_download) {
            return response()->json(['message' => 'Public download is disabled for this document.'], 403);
        }

        $document->increment('download_count');

        return $this->storage()->downloadResponse($document->path, $document->original_name ?: $document->name);
    }

    private function metaPayload(?int $userId): array
    {
        $documents = Document::query()->get();
        $storageUsed = (int) $documents->where('in_trash', false)->sum('size_bytes');

        $duplicates = Document::query()
            ->select('duplicate_hash', DB::raw('count(*) as duplicate_count'))
            ->whereNotNull('duplicate_hash')
            ->groupBy('duplicate_hash')
            ->havingRaw('count(*) > 1')
            ->get()
            ->map(fn ($row) => [
                'hash' => $row->duplicate_hash,
                'count' => (int) $row->duplicate_count,
            ])
            ->values();

        return [
            'storage' => [
                'used' => $storageUsed,
                'limit' => self::STORAGE_LIMIT_BYTES,
                'free' => max(self::STORAGE_LIMIT_BYTES - $storageUsed, 0),
            ],
            'recentFiles' => Document::query()
                ->where('in_trash', false)
                ->orderByDesc('last_opened_at')
                ->orderByDesc('updated_at')
                ->limit(6)
                ->get()
                ->map(fn (Document $document) => $this->documentListPayload($document))
                ->values(),
            'quickAccess' => Document::query()
                ->where('is_pinned', true)
                ->where('in_trash', false)
                ->latest('updated_at')
                ->limit(6)
                ->get()
                ->map(fn (Document $document) => $this->documentListPayload($document))
                ->values(),
            'topFiles' => Document::query()
                ->where('in_trash', false)
                ->orderByDesc(DB::raw('access_count + download_count'))
                ->limit(5)
                ->get()
                ->map(fn (Document $document) => $this->documentListPayload($document))
                ->values(),
            'recentActivity' => DocumentActivity::query()
                ->with('user')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (DocumentActivity $activity) => [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'userName' => $activity->user?->name,
                    'createdAt' => optional($activity->created_at)?->toISOString(),
                ])
                ->values(),
            'duplicates' => $duplicates,
            'trashStats' => [
                'count' => Document::query()->where('in_trash', true)->count(),
                'autoDeleteDays' => 30,
            ],
            'recentSearches' => [],
        ];
    }

    private function documentPayload(Document $document): array
    {
        $document->loadMissing(['owner', 'shares', 'versions', 'activities.user']);

        return array_merge($this->documentListPayload($document), [
            'originalName' => $document->original_name,
            'mimeType' => $document->mime_type,
            'folderName' => $document->folder_name,
            'previewText' => $document->preview_text,
            'description' => $document->description,
            'publicShare' => $document->public_share_token ? [
                'url' => url('/api/v1/documents/public/'.$document->public_share_token),
                'expiresAt' => optional($document->public_share_expires_at)?->toISOString(),
                'permission' => $document->public_share_permission,
                'allowDownload' => $document->allow_public_download,
            ] : null,
            'sharedWith' => $document->shares->map(fn (DocumentShare $share) => $this->sharePayload($share))->values(),
            'versions' => $document->versions->map(fn (DocumentVersion $version) => [
                'id' => $version->id,
                'versionNumber' => $version->version_number,
                'name' => $version->name,
                'originalName' => $version->original_name,
                'size' => (int) $version->size_bytes,
                'notes' => $version->notes,
                'createdAt' => optional($version->created_at)?->toISOString(),
            ])->values(),
            'activities' => $document->activities->map(fn (DocumentActivity $activity) => [
                'id' => $activity->id,
                'action' => $activity->action,
                'description' => $activity->description,
                'userName' => $activity->user?->name,
                'createdAt' => optional($activity->created_at)?->toISOString(),
            ])->values(),
            'accessCount' => (int) $document->access_count,
            'downloadCount' => (int) $document->download_count,
            'lastOpenedAt' => optional($document->last_opened_at)?->toISOString(),
            'duplicateCount' => Document::query()
                ->where('duplicate_hash', $document->duplicate_hash)
                ->where('id', '!=', $document->id)
                ->count(),
        ]);
    }

    private function documentListPayload(Document $document): array
    {
        return [
            'id' => $document->id,
            'name' => $document->name,
            'type' => $document->category,
            'extension' => $document->extension,
            'size' => (int) $document->size_bytes,
            'modified' => optional($document->updated_at)?->toISOString(),
            'owner' => $document->owner?->name ?? 'System',
            'ownerId' => $document->owner?->id,
            'ownerRole' => $document->owner?->role,
            'tags' => $document->tags ?? [],
            'url' => $this->storage()->publicUrl($document->path),
            'isFavorite' => (bool) $document->is_favorite,
            'isPinned' => (bool) $document->is_pinned,
            'isShared' => (bool) $document->is_shared,
            'isTrash' => (bool) $document->in_trash,
        ];
    }

    private function sharePayload(DocumentShare $share): array
    {
        return [
            'id' => $share->id,
            'recipient' => $share->recipient,
            'permission' => $share->permission,
            'shareType' => $share->share_type,
            'expiresAt' => optional($share->expires_at)?->toISOString(),
            'allowDownload' => (bool) $share->allow_download,
            'url' => $share->token ? url('/api/v1/documents/public/'.$share->token) : null,
        ];
    }

    private function createVersion(Document $document, UploadedFile $file, string $storedPath, ?int $userId, string $notes): void
    {
        $latestVersion = $document->versions()->max('version_number') ?? 0;

        DocumentVersion::create([
            'document_id' => $document->id,
            'uploaded_by' => $userId,
            'version_number' => $latestVersion + 1,
            'name' => $document->name,
            'original_name' => $file->getClientOriginalName(),
            'extension' => strtolower((string) $file->getClientOriginalExtension()),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'path' => $storedPath,
            'notes' => $notes,
        ]);
    }

    private function logActivity(?Document $document, Request $request, string $action, string $description, array $meta = []): void
    {
        DocumentActivity::create([
            'document_id' => $document?->id,
            'user_id' => $request->user()?->id,
            'action' => $action,
            'description' => $description,
            'meta' => $meta ?: null,
        ]);
    }

    private function normalizeTags(mixed $tags): array
    {
        if (is_string($tags)) {
            $tags = explode(',', $tags);
        }

        return collect(is_array($tags) ? $tags : [])
            ->map(fn ($tag) => strtolower(trim((string) $tag)))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function categorize(?string $extension, ?string $mimeType): string
    {
        $extension = strtolower((string) $extension);
        $mimeType = strtolower((string) $mimeType);

        return match (true) {
            str_contains($mimeType, 'image') || in_array($extension, ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg'], true) => 'IMG',
            $extension === 'pdf' => 'PDF',
            in_array($extension, ['doc', 'docx'], true) => 'DOC',
            in_array($extension, ['xls', 'xlsx', 'csv'], true) => 'SHEET',
            in_array($extension, ['ppt', 'pptx'], true) => 'SLIDE',
            $extension === 'txt' => 'TXT',
            default => 'FILE',
        };
    }

    private function previewTextFor(string $name): string
    {
        return sprintf('Preview generated for %s and ready in the document workspace.', $name);
    }

    private function storage(): DocumentFileStorage
    {
        return app(DocumentFileStorage::class);
    }

    private function actorRole(Request $request): string
    {
        return notification_role_display($request->user()?->role) ?? 'User';
    }

    private function actorName(Request $request): string
    {
        return $request->user()?->name ?? 'A user';
    }
}
