<?php

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Instantiate kernel to load environment, configurations, and database connections
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use App\Models\GeoserverConfig;

// Get Default GeoServer Configuration
$config = GeoserverConfig::where('is_default', true)->first() ?? GeoserverConfig::first();

if (!$config) {
    echo "=========================================\n";
    echo "ERROR: Tidak ada konfigurasi GeoServer di database.\n";
    echo "=========================================\n";
    exit;
}

echo "=========================================\n";
echo "GEOSERVER CONFIGURATION TEST\n";
echo "=========================================\n";
echo "Base URL:   " . $config->base_url . "\n";
echo "Username:   " . ($config->username ?: '(Kosong)') . "\n";
echo "Password:   " . ($config->password_encrypted ? str_repeat('*', strlen($config->password_encrypted)) : '(Kosong)') . "\n";
echo "Decrypted:  " . ($config->password_encrypted ?: '(Kosong)') . "\n";
echo "=========================================\n";

$baseUrl = rtrim($config->base_url, '/');
$capabilitiesUrl = $baseUrl . '/wms?service=WMS&request=GetCapabilities';

echo "Mengirim HTTP GET ke:\n" . $capabilitiesUrl . "\n\n";

$client = Http::timeout(10);
$testPassword = '@dminGeoServer';
echo "Testing with username: admin and password: " . $testPassword . "\n";
$client->withBasicAuth('admin', $testPassword);

try {
    $response = $client->get($capabilitiesUrl);
    echo "HTTP Status Code: " . $response->status() . "\n";
    
    if ($response->successful()) {
        echo "STATUS: KONEKSI BERHASIL! (200 OK)\n";
        echo "XML Response Length: " . strlen($response->body()) . " bytes\n";
        if (str_contains($response->body(), 'WMS_Capabilities')) {
            echo "Format valid: XML GetCapabilities teridentifikasi.\n";
        } else {
            echo "WARNING: Respon sukses tetapi tag WMS_Capabilities tidak ditemukan.\n";
        }
    } else {
        echo "STATUS: KONEKSI GAGAL! (HTTP " . $response->status() . ")\n";
        echo "Respon Body:\n" . substr($response->body(), 0, 500) . "\n...\n";
    }
} catch (\Exception $e) {
    echo "STATUS: ERROR EXCEPTION!\n";
    echo "Pesan Error: " . $e->getMessage() . "\n";
}
echo "=========================================\n";
