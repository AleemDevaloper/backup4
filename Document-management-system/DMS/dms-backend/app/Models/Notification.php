<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
     protected $fillable = [
        'title',
        'message',
        'role',
        'is_read',
    ];
}
