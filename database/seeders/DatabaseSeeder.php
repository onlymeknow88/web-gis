<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\GeoserverConfig;
use App\Models\GisLayer;
use App\Models\GisMarker;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users (Menggunakan firstOrCreate agar aman jika dijalankan berulang kali)
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password123'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'password' => bcrypt('password123'),
                'role' => 'user',
                'is_active' => true,
            ]
        );

        // Seed 12 additional regular users for pagination and search testing
        $sampleNames = [
            'Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dedi Kurniawan',
            'Eka Saputra', 'Fitri Rahmawati', 'Gilang Permana', 'Hendra Wijaya',
            'Indah Lestari', 'Joko Susilo', 'Kartika Sari', 'Lukman Hakim'
        ];

        foreach ($sampleNames as $index => $name) {
            $num = $index + 1;
            User::firstOrCreate(
                ['email' => "user{$num}@example.com"],
                [
                    'name' => $name,
                    'password' => bcrypt('password123'),
                    'role' => 'user',
                    'is_active' => true,
                ]
            );
        }

        // 2. Seed default GeoServer configuration
        $geoConfig = GeoserverConfig::updateOrCreate(
            ['base_url' => 'http://localhost:8080/geoserver'],
            [
                'name' => 'Local GeoServer',
                'workspace' => 'Indonesia',
                'username' => 'admin',
                'password_encrypted' => 'geoserver', // cast to encrypted automatically
                'is_default' => true,
            ]
        );

        // 3. Seed default GIS Layers (Menggunakan updateOrCreate agar aman)
        $layer1 = GisLayer::updateOrCreate(
            ['geoserver_layer' => 'Indonesia:AMC_CCoW_Bdy'],
            [
                'display_name' => 'AMC CCOW Boundary',
                'geoserver_url' => 'http://localhost:8080/geoserver/Indonesia/wms',
                'description' => 'Batas konsesi AMC CCOW',
                'is_active' => true,
                'display_order' => 1,
                'created_by' => $admin->id,
            ]
        );

        $layer2 = GisLayer::updateOrCreate(
            ['geoserver_layer' => 'Indonesia:Regional_Geology'],
            [
                'display_name' => 'Regional Geology',
                'geoserver_url' => 'http://localhost:8080/geoserver/Indonesia/wms',
                'description' => 'Peta geologi regional area kerja',
                'is_active' => false, // seeded as inactive to test toggle
                'display_order' => 2,
                'created_by' => $admin->id,
            ]
        );

        // 4. Seed default GIS Markers
        GisMarker::firstOrCreate(
            [
                'name' => 'Head Office Jakarta',
                'layer_id' => $layer1->id,
            ],
            [
                'longitude' => 106.827153,
                'latitude' => -6.175392,
                'description' => 'Kantor Pusat Administrasi Jakarta',
                'icon' => 'office',
                'is_active' => true,
                'created_by' => $admin->id,
            ]
        );

        GisMarker::firstOrCreate(
            [
                'name' => 'Mine Site Halmahera',
                'layer_id' => $layer1->id,
            ],
            [
                'longitude' => 127.973946,
                'latitude' => 1.484218,
                'description' => 'Lokasi Penambangan Halmahera',
                'icon' => 'mine',
                'is_active' => true,
                'created_by' => $admin->id,
            ]
        );

        // Opsional: jalankan GisLayerSeeder jika ingin memanggilnya secara terpisah
        $this->call([
            GisLayerSeeder::class,
        ]);
    }
}

