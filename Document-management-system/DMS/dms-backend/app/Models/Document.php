<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'original_name',
        'extension',
        'mime_type',
        'category',
        'size_bytes',
        'path',
        'folder_name',
        'preview_text',
        'description',
        'tags',
        'duplicate_hash',
        'is_favorite',
        'is_pinned',
        'is_shared',
        'in_trash',
        'trashed_at',
        'public_share_token',
        'public_share_expires_at',
        'public_share_permission',
        'allow_public_download',
        'access_count',
        'download_count',
        'last_opened_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_favorite' => 'boolean',
        'is_pinned' => 'boolean',
        'is_shared' => 'boolean',
        'in_trash' => 'boolean',
        'allow_public_download' => 'boolean',
        'trashed_at' => 'datetime',
        'public_share_expires_at' => 'datetime',
        'last_opened_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class)->latest('version_number');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(DocumentShare::class)->latest();
    }

    public function activities(): HasMany
    {
        return $this->hasMany(DocumentActivity::class)->latest();
    }
}
