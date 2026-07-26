<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GisLayer extends Model
{
    use HasFactory;

    protected $table = 'gis_layers';

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
        'display_name',
        'geoserver_layer',
        'geoserver_url',
        'description',
        'color',
        'is_active',
        'display_order',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function markers(): HasMany
    {
        return $this->hasMany(GisMarker::class, 'layer_id');
    }

    /**
     * Users that have explicit access to this layer.
     */
    public function permittedUsers()
    {
        return $this->belongsToMany(User::class, 'gis_layer_user', 'gis_layer_id', 'user_id');
    }

    /**
     * Custom styling overrides for individual features in this layer.
     */
    public function featureStyles()
    {
        return $this->hasMany(GisFeatureStyle::class, 'gis_layer_id');
    }
}
