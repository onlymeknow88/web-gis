<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Determine if the user is an administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Layers that the user has explicit access to.
     */
    public function accessibleLayers()
    {
        return $this->belongsToMany(GisLayer::class, 'gis_layer_user', 'user_id', 'gis_layer_id');
    }

    /**
     * Check if user has access to a layer.
     */
    public function hasAccessToLayer($layerId): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->accessibleLayers()->where('gis_layers.id', $layerId)->exists();
    }
}
