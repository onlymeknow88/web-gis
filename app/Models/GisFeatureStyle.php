<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GisFeatureStyle extends Model
{
    use HasFactory;

    protected $fillable = [
        'gis_layer_id',
        'feature_id',
        'feature_name',
        'color',
    ];

    /**
     * Get the GIS layer that owns this feature style.
     */
    public function layer()
    {
        return $this->belongsTo(GisLayer::class, 'gis_layer_id');
    }
}
