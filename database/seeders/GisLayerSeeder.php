<?php

namespace Database\Seeders;

use App\Models\GisLayer;
use App\Models\User;
use Illuminate\Database\Seeder;

class GisLayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari user administrator untuk mengisi field created_by
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $adminId = $admin ? $admin->id : null;

        // Seed data polygon layer 'Indonesia:AMC_CCoW_Bdy'
        GisLayer::updateOrCreate(
            [
                'geoserver_layer' => 'Indonesia:AMC_CCoW_Bdy',
            ],
            [
                'display_name' => 'AMC CCoW Boundary',
                'geoserver_url' => 'http://10.102.128.21:8080/geoserver/Indonesia/wms',
                'description' => 'Layer polygon untuk batas konsesi AMC CCoW dari GeoServer',
                'is_active' => true,
                'display_order' => 1,
                'created_by' => $adminId,
            ]
        );
    }
}
