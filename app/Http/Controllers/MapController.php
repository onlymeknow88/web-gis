<?php

namespace App\Http\Controllers;

use App\Models\GisLayer;
use App\Models\GisMarker;
use App\Models\GeoserverConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class MapController extends Controller
{
    /**
     * Show the interactive map page.
     */
    public function index()
    {
        $user = auth()->user();

        // Get all active layers from cache
        $allActiveLayers = Cache::remember('active_gis_layers', 3600, function () {
            return GisLayer::where('is_active', true)
                ->with('featureStyles')
                ->orderBy('display_order', 'asc')
                ->get();
        });

        // Get all active markers from cache
        $allActiveMarkers = Cache::remember('active_gis_markers', 3600, function () {
            return GisMarker::where('is_active', true)
                ->with(['layer' => function ($query) {
                    $query->select('id', 'display_name');
                }])
                ->get();
        });

        if ($user->isAdmin()) {
            $layers = $allActiveLayers;
            $markers = $allActiveMarkers;
        } else {
            // For regular users, only show layers they have been given access to
            $accessibleIds = $user->accessibleLayers()->pluck('gis_layers.id')->toArray();
            
            $layers = $allActiveLayers->filter(function ($layer) use ($accessibleIds) {
                return in_array($layer->id, $accessibleIds);
            })->values();

            $markers = $allActiveMarkers->filter(function ($marker) use ($accessibleIds) {
                return $marker->layer_id === null || in_array($marker->layer_id, $accessibleIds);
            })->values();
        }

        $geoserver = GeoserverConfig::where('is_default', true)->first();

        return Inertia::render('Map/Map', [
            'layers' => $layers,
            'markers' => $markers,
            'geoserver' => $geoserver,
        ]);
    }

    /**
     * Proxy request to GeoServer to bypass client-side CORS policy.
     */
    public function geoserverProxy(Request $request)
    {
        // Restrict proxy access to local development only
        if (!app()->environment('local')) {
            return response()->json(['error' => 'GeoServer Proxy is only available in local development.'], 403);
        }

        $geoserverUrl = $request->query('geoserver_url');
        if (!$geoserverUrl) {
            return response()->json(['error' => 'Missing geoserver_url parameter.'], 400);
        }

        $user = auth()->user();

        // Validate target URL is authorized to prevent SSRF
        $targetHost = parse_url($geoserverUrl, PHP_URL_HOST);
        
        $allowedLayersQuery = GisLayer::where('is_active', true);
        if (!$user->isAdmin()) {
            $accessibleIds = $user->accessibleLayers()->pluck('gis_layers.id')->toArray();
            $allowedLayersQuery->whereIn('id', $accessibleIds);
        }

        $allowedHosts = $allowedLayersQuery
            ->pluck('geoserver_url')
            ->map(fn($url) => parse_url($url, PHP_URL_HOST))
            ->filter()
            ->unique()
            ->toArray();

        $geoserverConfig = GeoserverConfig::where('is_default', true)->first() ?? GeoserverConfig::first();
        if ($geoserverConfig && $geoserverConfig->base_url) {
            $allowedHosts[] = parse_url($geoserverConfig->base_url, PHP_URL_HOST);
        }
        $allowedHosts = array_unique(array_filter($allowedHosts));

        if (!in_array($targetHost, $allowedHosts)) {
            return response()->json(['error' => 'Unauthorized host or unauthorized layer access.'], 403);
        }

        try {
            $client = Http::timeout(10);

            // Add Basic Authentication if configured on the default GeoServer
            if ($geoserverConfig && $geoserverConfig->username && $geoserverConfig->password_encrypted) {
                $client->withBasicAuth($geoserverConfig->username, $geoserverConfig->password_encrypted);
            }

            $response = $client->get($geoserverUrl);

            // Fallback to anonymous request if basic auth returns 401 Unauthorized
            if ($response->status() === 401) {
                $response = Http::timeout(10)->get($geoserverUrl);
            }
            
            return response($response->body(), $response->status())
                ->header('Content-Type', $response->header('Content-Type') ?: 'application/json');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to proxy request: ' . $e->getMessage()
            ], 500);
        }
    }

}
