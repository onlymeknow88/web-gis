<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_logs';

    public $timestamps = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (! $model->id) {
                try {
                    $maxId = (int) self::max('id');
                    $model->id = $maxId + 1;
                } catch (\Exception $e) {
                    $model->id = (int) (microtime(true) * 100) + rand(1, 99);
                }
            }
            // Manually assign current timestamp to bypass missing DB defaults
            if (! $model->created_at) {
                $model->created_at = now();
            }
        });
    }

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'old_value',
        'new_value',
        'ip_address',
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Helper to log an activity.
     */
    public static function log(string $action, string $module, ?string $description = null, ?array $oldValue = null, ?array $newValue = null): self
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'ip_address' => request()->ip(),
        ]);
    }
}
