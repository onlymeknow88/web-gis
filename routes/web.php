<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GisLayerController;
use App\Http\Controllers\GisMarkerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GeoserverConfigController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

// Redirect guests to login, authenticated users to interactive map
Route::get('/', [MapController::class, 'index'])
    ->middleware(['auth'])
    ->name('map');

// Admin panel routes (requires admin role)
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Summary / Home
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // GIS Layers Management
    Route::get('/admin/layers', [GisLayerController::class, 'index'])->name('admin.layers.index');
    Route::post('/admin/layers', [GisLayerController::class, 'store'])->name('admin.layers.store');
    Route::post('/admin/layers/upload-shp', [GisLayerController::class, 'uploadShapefile'])->name('admin.layers.upload-shp');
    Route::put('/admin/layers/{layer}', [GisLayerController::class, 'update'])->name('admin.layers.update');
    Route::delete('/admin/layers/{layer}', [GisLayerController::class, 'destroy'])->name('admin.layers.destroy');
    Route::patch('/admin/layers/{layer}/toggle', [GisLayerController::class, 'toggle'])->name('admin.layers.toggle');
    Route::post('/admin/layers/{layer}/generate-marker', [GisLayerController::class, 'generateMarker'])->name('admin.layers.generate-marker');
    Route::put('/admin/layers/{layer}/access', [GisLayerController::class, 'updateAccess'])->name('admin.layers.update-access');
    Route::get('/admin/layers/{layer}/features', [GisLayerController::class, 'getFeatures'])->name('admin.layers.features');
    Route::post('/admin/layers/{layer}/features/style', [GisLayerController::class, 'updateFeatureStyle'])->name('admin.layers.features.style');


    // GIS Markers Management
    Route::get('/admin/markers', [GisMarkerController::class, 'index'])->name('admin.markers.index');
    Route::post('/admin/markers', [GisMarkerController::class, 'store'])->name('admin.markers.store');
    Route::put('/admin/markers/{marker}', [GisMarkerController::class, 'update'])->name('admin.markers.update');
    Route::delete('/admin/markers/{marker}', [GisMarkerController::class, 'destroy'])->name('admin.markers.destroy');
    Route::post('/admin/markers/import', [GisMarkerController::class, 'import'])->name('admin.markers.import');
    Route::get('/admin/markers/export', [GisMarkerController::class, 'export'])->name('admin.markers.export');

    // User Management
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/admin/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('admin.users.reset-password');
    Route::put('/admin/users/{user}/access', [UserController::class, 'updateAccess'])->name('admin.users.update-access');

    // GeoServer Configuration
    Route::get('/admin/config/geoserver', [GeoserverConfigController::class, 'index'])->name('admin.geoserver.index');
    Route::post('/admin/config/geoserver', [GeoserverConfigController::class, 'update'])->name('admin.geoserver.update');
    Route::post('/admin/config/geoserver/test', [GeoserverConfigController::class, 'testConnection'])->name('admin.geoserver.test');

    // Activity Logs / Audit Trail
    Route::get('/admin/logs', [ActivityLogController::class, 'index'])->name('admin.logs.index');
    Route::get('/admin/logs/export', [ActivityLogController::class, 'export'])->name('admin.logs.export');
});

// Profile management (all authenticated users)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // GeoServer proxy route to bypass CORS policy
    Route::get('/geoserver/proxy', [MapController::class, 'geoserverProxy'])->name('geoserver.proxy');
});

require __DIR__.'/auth.php';
