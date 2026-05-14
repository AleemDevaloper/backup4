<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentShare extends Model
{
    protected $fillable = [
        'document_id',
        'shared_by',
        'recipient',
        'permission',
        'share_type',
        'token',
        'expires_at',
        'allow_download',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'allow_download' => 'boolean',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function sharer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by');
    }
}
