<?php

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "=========================================\n";
    echo "MEMPERBARUI URL GEOSERVER DI DATABASE\n";
    echo "=========================================\n";

    // 1. Update gis_layers table
    $affectedLayers = DB::table('gis_layers')
        ->where('geoserver_url', 'like', '%localhost:8080%')
        ->update([
            'geoserver_url' => DB::raw("REPLACE(geoserver_url, 'localhost:8080', '10.102.128.21:8080')")
        ]);

    echo "Jumlah layer yang diperbarui: {$affectedLayers}\n";

    // 2. Update geoserver_configs table
    $affectedConfigs = DB::table('geoserver_configs')
        ->where('base_url', 'like', '%localhost:8080%')
        ->update([
            'base_url' => DB::raw("REPLACE(base_url, 'localhost:8080', '10.102.128.21:8080')")
        ]);

    echo "Jumlah konfigurasi global yang diperbarui: {$affectedConfigs}\n";
    echo "=========================================\n";
    echo "SUKSES: Database berhasil dibersihkan dari localhost:8080!\n";
    echo "=========================================\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
