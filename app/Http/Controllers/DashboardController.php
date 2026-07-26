<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\GisLayer;
use App\Models\GisMarker;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the main admin dashboard home screen with statistics and charts.
     */
    public function index()
    {
        // 1. Core counters
        $stats = [
            'layers' => [
                'total' => GisLayer::count(),
                'active' => GisLayer::where('is_active', true)->count(),
                'inactive' => GisLayer::where('is_active', false)->count(),
            ],
            'markers' => [
                'total' => GisMarker::count(),
                'active' => GisMarker::where('is_active', true)->count(),
                'inactive' => GisMarker::where('is_active', false)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'admins' => User::where('role', 'admin')->count(),
                'regular' => User::where('role', 'user')->count(),
            ],
            'activity_today' => ActivityLog::whereDate('created_at', today())->count(),
        ];

        // 2. Latest 5 logs
        $latestLogs = ActivityLog::with('user')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 3. Last 7 Days Activity count (grouped by day)
        $activitiesLast7Days = ActivityLog::where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'label' => $date->translatedFormat('d M'),
                'count' => $activitiesLast7Days[$dateStr] ?? 0,
            ];
        }

        // 4. System info
        $driveLetter = substr(base_path(), 0, 2); // Gets "C:" or "D:" on Windows
        try {
            $totalBytes = disk_total_space($driveLetter);
            $freeBytes = disk_free_space($driveLetter);
            $usedBytes = $totalBytes - $freeBytes;

            $totalGb = round($totalBytes / 1073741824, 1);
            $usedGb = round($usedBytes / 1073741824, 1);
            $freeGb = round($freeBytes / 1073741824, 1);
        } catch (\Exception $e) {
            $totalGb = 0;
            $usedGb = 0;
            $freeGb = 0;
        }

        $systemInfo = [
            'app_version' => 'WebGIS v1.0.0',
            'storage_used_gb' => $usedGb,
            'storage_total_gb' => $totalGb,
            'storage_free_gb' => $freeGb,
            'drive_letter' => $driveLetter,
        ];

        return Inertia::render('Dashboard/Dashboard', [
            'stats' => $stats,
            'latestLogs' => $latestLogs,
            'chartData' => $chartData,
            'systemInfo' => $systemInfo,
        ]);
    }
}
