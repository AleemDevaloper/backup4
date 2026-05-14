<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    protected $fillable = [
        'created_by',
        'name',
        'sr_no',
        'client',
        'description',
        'submission_time',
        'status',
        'team_size',
        'file',
    ];

    protected $casts = [
        'submission_time' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
