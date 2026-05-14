<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentActivity extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'action',
        'description',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
