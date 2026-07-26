<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeoserverConfig extends Model
{
    use HasFactory;

    protected $table = 'geoserver_configs';

    protected $fillable = [
        'name',
        'base_url',
        'workspace',
        'username',
        'password_encrypted',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'password_encrypted' => 'encrypted',
    ];
}
