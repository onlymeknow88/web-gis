<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GisMarker extends Model
{
    use HasFactory;

    protected $table = 'gis_markers';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->id) {
                try {
                    $maxId = (int) self::max('id');
                    $model->id = $maxId + 1;
                } catch (\Exception $e) {
                    $model->id = (int) (microtime(true) * 100) + rand(1, 99);
                }
            }
        });
    }

    protected $fillable = [
        'name',
        'longitude',
        'latitude',
        'description',
        'icon',
        'layer_id',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'longitude' => 'float',
        'latitude' => 'float',
        'is_active' => 'boolean',
    ];

    public function layer(): BelongsTo
    {
        return $this->belongsTo(GisLayer::class, 'layer_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
