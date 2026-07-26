<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\GisLayer;
use App\Models\GisMarker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class GisTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that map page requires authentication.
     */
    public function test_map_page_requires_auth(): void
    {
        $response = $this->get('/');
        $response->assertRedirect('/login');
    }

    /**
     * Test that map page is loaded correctly for authenticated users.
     */
    public function test_map_page_displays_layers_and_markers(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $layer = GisLayer::create([
            'display_name' => 'Test Layer',
            'geoserver_layer' => 'workspace:test_layer',
            'geoserver_url' => 'https://geoserver.example.com/wms',
            'description' => 'Test layer description',
            'is_active' => true,
            'display_order' => 1,
            'created_by' => $user->id,
        ]);

        $marker = GisMarker::create([
            'name' => 'Test Marker',
            'longitude' => 120.12345,
            'latitude' => -3.12345,
            'description' => 'Test marker description',
            'is_active' => true,
            'layer_id' => $layer->id,
            'created_by' => $user->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/');

        $response->assertOk();
    }

    /**
     * Test caching of active GIS layers.
     */
    public function test_caching_of_gis_layers(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Cache::forget('active_gis_layers');

        // Access map page to trigger cache remember
        $this->actingAs($user)->get('/');

        $this->assertTrue(Cache::has('active_gis_layers'));

        // Delete cache using forget
        Cache::forget('active_gis_layers');
        $this->assertFalse(Cache::has('active_gis_layers'));
    }

    /**
     * Test export markers endpoint.
     */
    public function test_export_markers_geojson_endpoint(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/admin/markers/export?format=geojson');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/geo+json');
    }
}
