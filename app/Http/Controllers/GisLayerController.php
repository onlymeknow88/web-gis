<?php

namespace App\Http\Controllers;

use App\Models\GisLayer;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GisLayerController extends Controller
{
    /**
     * Display a listing of the layers.
     */
    public function index(Request $request)
    {
        $query = GisLayer::query()->with(['creator', 'permittedUsers']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('display_name', 'like', "%{$search}%")
                  ->orWhere('geoserver_layer', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status') === 'active' ? 1 : 0;
            $query->where('is_active', $status);
        }

        $limit = $request->input('limit', 10);
        if ($limit === 'all') {
            $limit = $query->count() ?: 10;
        } else {
            $limit = (int) $limit;
            if (!in_array($limit, [10, 20, 30, 50])) {
                $limit = 10;
            }
        }

        $layers = $query->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Layer/Layers', [
            'layers' => $layers,
            'filters' => $request->only(['search', 'status', 'limit']),
            'users' => \App\Models\User::where('role', 'user')->where('is_active', true)->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Store a newly created layer in storage.
     */
    public function store(Request $request)
    {
        $geoserverConfig = \App\Models\GeoserverConfig::where('is_default', true)->first()
            ?? \App\Models\GeoserverConfig::first();
        $geoserverUrl = $geoserverConfig
            ? rtrim($geoserverConfig->base_url, '/') . '/' . $geoserverConfig->workspace . '/wms'
            : 'http://10.102.128.21:8080/geoserver/wms';

        $request->merge(['geoserver_url' => $geoserverUrl]);

        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'geoserver_layer' => 'required|string|max:255|unique:gis_layers,geoserver_layer',
            'geoserver_url' => 'required|url',
            'description' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'is_active' => 'required|boolean',
            'display_order' => 'required|integer|min:0',
        ]);

        $validated['created_by'] = auth()->id();
        $layer = GisLayer::create($validated);

        \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

        ActivityLog::log(
            action: 'CREATE',
            module: 'Layer GIS',
            description: "Membuat layer GIS baru: {$layer->display_name}",
            newValue: $layer->toArray()
        );

        return redirect()->back()->with('message', 'Layer berhasil ditambahkan.');
    }

    /**
     * Update the specified layer in storage.
     */
    public function update(Request $request, GisLayer $layer)
    {
        $geoserverConfig = \App\Models\GeoserverConfig::where('is_default', true)->first()
            ?? \App\Models\GeoserverConfig::first();
        $geoserverUrl = $geoserverConfig
            ? rtrim($geoserverConfig->base_url, '/') . '/' . $geoserverConfig->workspace . '/wms'
            : 'http://10.102.128.21:8080/geoserver/wms';

        $request->merge(['geoserver_url' => $geoserverUrl]);

        $rules = [
            'display_name' => 'required|string|max:255',
            'zip_file' => 'nullable|file|max:51200',
            'description' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'is_active' => 'required|boolean',
            'display_order' => 'required|integer|min:0',
        ];

        // Only require geoserver_layer if no zip_file is uploaded
        if (!$request->hasFile('zip_file')) {
            $rules['geoserver_layer'] = [
                'required',
                'string',
                'max:255',
                Rule::unique('gis_layers', 'geoserver_layer')->ignore($layer->id),
            ];
        }

        $validated = $request->validate($rules);

        // If file is uploaded, process file upload first
        if ($request->hasFile('zip_file')) {
            if (!$geoserverConfig) {
                return redirect()->back()->withErrors([
                    'error' => 'Konfigurasi GeoServer belum diatur.'
                ]);
            }

            $zipFile = $request->file('zip_file');
            $extension = strtolower($zipFile->getClientOriginalExtension());
            if ($extension !== 'zip') {
                return redirect()->back()->withErrors([
                    'error' => 'File harus berupa arsip ZIP (.zip).'
                ]);
            }

            $zipPath = $zipFile->getRealPath();

            // Open zip to validate shapefile files
            $zip = new \ZipArchive;
            $shpBaseName = null;
            $hasShp = $hasDbf = $hasShx = false;

            if ($zip->open($zipPath) === true) {
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                    if ($ext === 'shp') {
                        $hasShp = true;
                        $shpBaseName = pathinfo($filename, PATHINFO_FILENAME);
                    }
                    if ($ext === 'dbf') {
                        $hasDbf = true;
                    }
                    if ($ext === 'shx') {
                        $hasShx = true;
                    }
                }
                $zip->close();
            } else {
                return redirect()->back()->withErrors([
                    'error' => 'Gagal membuka file ZIP.'
                ]);
            }

            if (!$hasShp || !$hasDbf || !$hasShx) {
                return redirect()->back()->withErrors([
                    'error' => 'File ZIP harus berisi file .shp, .dbf, dan .shx.'
                ]);
            }

            $shpName = preg_replace('/[^a-zA-Z0-9_]/', '_', $shpBaseName);
            $geoserverLayer = "{$geoserverConfig->workspace}:{$shpName}";

            // Check if this layer name already exists for other layers
            if (\App\Models\GisLayer::where('geoserver_layer', $geoserverLayer)->where('id', '!=', $layer->id)->exists()) {
                return redirect()->back()->withErrors([
                    'error' => "Layer dengan nama GeoServer '{$geoserverLayer}' sudah digunakan oleh layer lain."
                ]);
            }

            // Upload to GeoServer
            $baseUrl = rtrim($geoserverConfig->base_url, '/');
            $workspace = $geoserverConfig->workspace;
            $uploadUrl = "{$baseUrl}/rest/workspaces/{$workspace}/datastores/{$shpName}/file.shp";

            $client = Http::timeout(120);
            if ($geoserverConfig->username && $geoserverConfig->password_encrypted) {
                $client->withBasicAuth($geoserverConfig->username, $geoserverConfig->password_encrypted);
            }

            $response = $client->withHeaders([
                'Content-Type' => 'application/zip',
            ])->withBody(file_get_contents($zipPath), 'application/zip')
              ->put($uploadUrl);

            if (!$response->successful()) {
                return redirect()->back()->withErrors([
                    'error' => 'GeoServer REST API gagal memproses upload data baru.'
                ]);
            }

            // Update database data
            $validated['geoserver_layer'] = $geoserverLayer;
            $validated['geoserver_url'] = "{$baseUrl}/{$workspace}/wms";
        } else {
            $validated['geoserver_url'] = $geoserverUrl;
        }

        $oldValue = $layer->toArray();
        $layer->update($validated);

        \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

        ActivityLog::log(
            action: 'UPDATE',
            module: 'Layer GIS',
            description: "Memperbarui layer GIS: {$layer->display_name}" . ($request->hasFile('zip_file') ? ' (Data Shapefile diperbarui)' : ''),
            oldValue: $oldValue,
            newValue: $layer->toArray()
        );

        // Regenerate marker if shapefile was updated
        if ($request->hasFile('zip_file')) {
            try {
                $this->generateMarker($layer);
            } catch (\Exception $me) {
                \Illuminate\Support\Facades\Log::warning('Auto marker generation failed after update: ' . $me->getMessage());
            }
        }

        return redirect()->back()->with('message', 'Layer berhasil diperbarui.');
    }

    /**
     * Remove the specified layer from storage.
     */
    public function destroy(GisLayer $layer)
    {
        // Check if there are associated markers
        if ($layer->markers()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Layer tidak dapat dihapus karena masih memiliki marker terkait.'
            ]);
        }

        $oldValue = $layer->toArray();
        $layer->delete();

        \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

        ActivityLog::log(
            action: 'DELETE',
            module: 'Layer GIS',
            description: "Menghapus layer GIS: {$oldValue['display_name']}",
            oldValue: $oldValue
        );

        return redirect()->back()->with('message', 'Layer berhasil dihapus.');
    }

    /**
     * Toggle the active status of the layer.
     */
    public function toggle(GisLayer $layer)
    {
        $oldValue = $layer->toArray();
        $layer->is_active = !$layer->is_active;
        $layer->save();

        \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

        ActivityLog::log(
            action: 'TOGGLE_STATUS',
            module: 'Layer GIS',
            description: "Mengubah status aktif layer GIS {$layer->display_name} menjadi " . ($layer->is_active ? 'Aktif' : 'Non-aktif'),
            oldValue: $oldValue,
            newValue: $layer->toArray()
        );

        return redirect()->back()->with('message', 'Status layer berhasil diubah.');
    }

    /**
     * Automatically generate a center marker for a WMS layer by retrieving its bounding box from GeoServer.
     */
    public function generateMarker(GisLayer $layer)
    {
        $baseUrl = rtrim($layer->geoserver_url, '/');
        // Append GetCapabilities parameter
        $capabilitiesUrl = str_contains($baseUrl, '?')
            ? $baseUrl . '&service=WMS&request=GetCapabilities'
            : $baseUrl . '?service=WMS&request=GetCapabilities';

        try {
            $client = Http::timeout(10);

            // Authenticate if GeoServer has configured credentials
            $geoserverConfig = \App\Models\GeoserverConfig::where('is_default', true)->first()
                ?? \App\Models\GeoserverConfig::first();
            if ($geoserverConfig && $geoserverConfig->username && $geoserverConfig->password_encrypted) {
                $client->withBasicAuth($geoserverConfig->username, $geoserverConfig->password_encrypted);
            }

            $response = $client->get($capabilitiesUrl);

            // Fallback to anonymous request if basic auth returns 401 Unauthorized
            if ($response->status() === 401) {
                $response = Http::timeout(10)->get($capabilitiesUrl);
            }

            if (!$response->successful()) {
                return redirect()->back()->withErrors([
                    'error' => 'Gagal mengambil Capabilities dari GeoServer. HTTP Status: ' . $response->status()
                ]);
            }

            $xmlContent = $response->body();

            // Parse XML with error suppression to avoid PHP warnings being converted to Laravel Exceptions
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlContent);
            if (!$xml) {
                libxml_clear_errors();
                return redirect()->back()->withErrors([
                    'error' => 'Gagal memproses XML Capabilities dari GeoServer.'
                ]);
            }

            // Register WMS namespaces if present
            $namespaces = $xml->getDocNamespaces(true);
            foreach ($namespaces as $prefix => $ns) {
                $xml->registerXPathNamespace($prefix ?: 'wms', $ns);
            }
            $nsPrefix = isset($namespaces['']) ? 'wms:' : '';

            $layerName = $layer->geoserver_layer;
            $shortName = str_contains($layerName, ':') ? explode(':', $layerName)[1] : $layerName;

            // Search for target Layer element (both full name and short name)
            $xpathQuery = "//" . $nsPrefix . "Layer[" . $nsPrefix . "Name='" . $layerName . "' or " . $nsPrefix . "Name='" . $shortName . "']";
            $layerNodes = $xml->xpath($xpathQuery);

            // Fallback: If xpath fails, try a direct namespace-less xpath
            if (empty($layerNodes)) {
                $xmlWithoutNs = preg_replace('/xmlns[^=]*="[^"]*"/i', '', $xmlContent);
                $cleanXml = simplexml_load_string($xmlWithoutNs);
                if ($cleanXml) {
                    $layerNodes = $cleanXml->xpath("//Layer[Name='" . $layerName . "' or Name='" . $shortName . "']");
                }
            }

            libxml_clear_errors();

            if (empty($layerNodes)) {
                return redirect()->back()->withErrors([
                    'error' => "Layer '{$layer->geoserver_layer}' tidak ditemukan di respon Capabilities GeoServer."
                ]);
            }

            $layerNode = $layerNodes[0];
            $minx = $miny = $maxx = $maxy = null;

            // Parse coordinates from LatLonBoundingBox
            if (isset($layerNode->LatLonBoundingBox)) {
                $attrs = $layerNode->LatLonBoundingBox->attributes();
                $minx = (float)$attrs['minx'];
                $miny = (float)$attrs['miny'];
                $maxx = (float)$attrs['maxx'];
                $maxy = (float)$attrs['maxy'];
            }
            // Parse coordinates from BoundingBox CRS="EPSG:4326"
            elseif (isset($layerNode->BoundingBox)) {
                foreach ($layerNode->BoundingBox as $bbox) {
                    $attrs = $bbox->attributes();
                    $crs = (string)($attrs['CRS'] ?? $attrs['SRS'] ?? '');
                    if (str_contains(strtoupper($crs), '4326')) {
                        // Standard EPSG:4326 coordinate order checking based on WMS version
                        $wmsVersion = (string)($xml->attributes()['version'] ?? '1.1.1');
                        if (str_starts_with($wmsVersion, '1.3')) {
                            // WMS 1.3.0 uses (lat, lon) order for EPSG:4326
                            $miny = (float)$attrs['minx'];
                            $minx = (float)$attrs['miny'];
                            $maxy = (float)$attrs['maxx'];
                            $maxx = (float)$attrs['maxy'];
                        } else {
                            $minx = (float)$attrs['minx'];
                            $miny = (float)$attrs['miny'];
                            $maxx = (float)$attrs['maxx'];
                            $maxy = (float)$attrs['maxy'];
                        }
                        break;
                    }
                }
            }

            // Regular expression fallback
            if ($minx === null || $miny === null || $maxx === null || $maxy === null) {
                $pattern = '/<Layer[^>]*>.*?<Name>' . preg_quote($layer->geoserver_layer, '/') . '<\/Name>.*?<LatLonBoundingBox\s+minx="([^"]+)"\s+miny="([^"]+)"\s+maxx="([^"]+)"\s+maxy="([^"]+)"/is';
                if (preg_match($pattern, $xmlContent, $matches)) {
                    $minx = (float)$matches[1];
                    $miny = (float)$matches[2];
                    $maxx = (float)$matches[3];
                    $maxy = (float)$matches[4];
                }
            }

            if ($minx === null || $miny === null || $maxx === null || $maxy === null) {
                return redirect()->back()->withErrors([
                    'error' => 'Gagal membaca koordinat batas (BoundingBox) untuk layer ini dari GeoServer.'
                ]);
            }

            // Compute center point
            $longitude = ($minx + $maxx) / 2;
            $latitude = ($miny + $maxy) / 2;

            // Create or update the associated marker
            $markerName = "Pusat " . $layer->display_name;
            $marker = \App\Models\GisMarker::updateOrCreate(
                ['layer_id' => $layer->id],
                [
                    'name' => $markerName,
                    'longitude' => round($longitude, 7),
                    'latitude' => round($latitude, 7),
                    'description' => "Marker otomatis dibuat berdasarkan pusat batas geoserver layer '{$layer->geoserver_layer}'",
                    'icon' => 'standard',
                    'is_active' => true,
                    'created_by' => auth()->id(),
                ]
            );

            \Illuminate\Support\Facades\Cache::forget('active_gis_markers');

            ActivityLog::log(
                action: 'CREATE',
                module: 'Marker GIS',
                description: "Membuat marker otomatis dari layer GIS: {$layer->display_name}",
                newValue: $marker->toArray()
            );

            return redirect()->back()->with('message', "Berhasil membuat marker '{$markerName}' pada koordinat Lon: {$marker->longitude}, Lat: {$marker->latitude}");

        } catch (\Exception $e) {
            libxml_clear_errors();
            return redirect()->back()->withErrors([
                'error' => 'Terjadi kesalahan saat memproses data GeoServer: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Upload a shapefile (zip) to GeoServer and create a new layer.
     */
    public function uploadShapefile(Request $request)
    {
        $request->validate([
            'display_name' => 'required|string|max:255',
            'zip_file' => 'required|file|max:51200', // max 50MB
            'description' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'display_order' => 'required|integer|min:0',
            'is_active' => 'required|boolean',
        ]);

        // Get GeoServer configuration
        $geoserverConfig = \App\Models\GeoserverConfig::where('is_default', true)->first()
            ?? \App\Models\GeoserverConfig::first();

        if (!$geoserverConfig) {
            return redirect()->back()->withErrors([
                'error' => 'Konfigurasi GeoServer belum diatur. Silakan atur terlebih dahulu di menu GeoServer Config.'
            ]);
        }

        $zipFile = $request->file('zip_file');

        if (!$zipFile || !$zipFile->isValid()) {
            $errorMsg = $zipFile ? $zipFile->getErrorMessage() : 'File tidak terunggah.';
            return redirect()->back()->withErrors([
                'error' => 'Upload file ZIP gagal: ' . $errorMsg
            ]);
        }

        $extension = strtolower($zipFile->getClientOriginalExtension());
        if ($extension !== 'zip') {
            return redirect()->back()->withErrors([
                'error' => 'File harus berupa arsip ZIP (.zip).'
            ]);
        }

        $zipPath = $zipFile->getPathname();

        // 1. Open zip to find .shp file and extract its base name
        $zip = new \ZipArchive;
        $shpBaseName = null;
        $hasShp = false;
        $hasDbf = false;
        $hasShx = false;

        if ($zip->open($zipPath) === true) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
                if ($ext === 'shp') {
                    $hasShp = true;
                    $shpBaseName = pathinfo($filename, PATHINFO_FILENAME);
                }
                if ($ext === 'dbf') {
                    $hasDbf = true;
                }
                if ($ext === 'shx') {
                    $hasShx = true;
                }
            }
            $zip->close();
        } else {
            return redirect()->back()->withErrors([
                'error' => 'Gagal membuka file ZIP.'
            ]);
        }

        if (!$hasShp || !$hasDbf || !$hasShx) {
            return redirect()->back()->withErrors([
                'error' => 'File ZIP harus berisi setidaknya file .shp, .dbf, dan .shx dari Shapefile.'
            ]);
        }

        if (!$shpBaseName) {
            return redirect()->back()->withErrors([
                'error' => 'Tidak dapat mendeteksi nama file Shapefile.'
            ]);
        }

        // Clean shapefile name to be a safe string for GeoServer (alphanumeric and underscores)
        $shpName = preg_replace('/[^a-zA-Z0-9_]/', '_', $shpBaseName);
        $geoserverLayer = "{$geoserverConfig->workspace}:{$shpName}";

        // 2. Check if this layer already exists in the database
        if (\App\Models\GisLayer::where('geoserver_layer', $geoserverLayer)->exists()) {
            return redirect()->back()->withErrors([
                'error' => "Layer dengan nama GeoServer '{$geoserverLayer}' sudah ada di database."
            ]);
        }

        // 3. Upload to GeoServer REST API
        $baseUrl = rtrim($geoserverConfig->base_url, '/');
        $workspace = $geoserverConfig->workspace;

        // GeoServer PUT URL format:
        // /rest/workspaces/{workspace}/datastores/{datastore}/file.shp
        $uploadUrl = "{$baseUrl}/rest/workspaces/{$workspace}/datastores/{$shpName}/file.shp";

        try {
            $client = Http::timeout(120); // shapefile uploads can take longer

            if ($geoserverConfig->username && $geoserverConfig->password_encrypted) {
                $client->withBasicAuth($geoserverConfig->username, $geoserverConfig->password_encrypted);
            }

            $response = $client->withHeaders([
                'Content-Type' => 'application/zip',
            ])->withBody(file_get_contents($zipPath), 'application/zip')
              ->put($uploadUrl);

            // GeoServer REST returns 201 Created or 200 OK on success
            if (!$response->successful()) {
                \Illuminate\Support\Facades\Log::error('GeoServer Shapefile Upload Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return redirect()->back()->withErrors([
                    'error' => 'GeoServer REST API gagal memproses upload. Status: ' . $response->status() . '. Detail: ' . $response->body()
                ]);
            }

            // 4. Create new layer record in database
            // WMS URL: base_url + /workspace + /wms
            $geoserverWmsUrl = "{$baseUrl}/{$workspace}/wms";

            $layerData = [
                'display_name' => $request->input('display_name'),
                'geoserver_layer' => $geoserverLayer,
                'geoserver_url' => $geoserverWmsUrl,
                'description' => $request->input('description') ?? "Diupload via Shapefile: {$shpBaseName}",
                'color' => $request->input('color'),
                'display_order' => $request->input('display_order'),
                'is_active' => $request->input('is_active'),
                'created_by' => auth()->id(),
            ];

            $layer = GisLayer::create($layerData);

            // Flush cache
            \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

            // Log activity
            ActivityLog::log(
                action: 'UPLOAD_SHP',
                module: 'Layer GIS',
                description: "Mengunggah file Shapefile dan membuat layer GIS baru: {$layer->display_name}",
                newValue: $layer->toArray()
            );

            // 5. Try to automatically generate a marker for this layer
            try {
                $this->generateMarker($layer);
            } catch (\Exception $me) {
                // Just log the marker generation failure but don't fail the whole request
                \Illuminate\Support\Facades\Log::warning('Auto marker generation failed after SHP upload: ' . $me->getMessage());
            }

            return redirect()->back()->with('message', "Layer '{$layer->display_name}' berhasil diunggah ke GeoServer dan ditambahkan.");

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Exception during Shapefile upload to GeoServer: ' . $e->getMessage());
            return redirect()->back()->withErrors([
                'error' => 'Terjadi kesalahan sistem saat menghubungi GeoServer: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update user-specific layer permissions.
     */
    public function updateAccess(Request $request, GisLayer $layer)
    {
        $request->validate([
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $userIds = $request->input('user_ids', []);

        // Sync the user ids on this layer
        $layer->permittedUsers()->sync($userIds);

        ActivityLog::log(
            action: 'UPDATE_ACCESS',
            module: 'Layer GIS',
            description: "Memperbarui hak akses pengguna untuk layer GIS: {$layer->display_name}",
            newValue: ['layer_id' => $layer->id, 'user_ids' => $userIds]
        );

        return redirect()->back()->with('message', "Akses pengguna untuk layer '{$layer->display_name}' berhasil diperbarui.");
    }

    /**
     * Fetch features of a layer from GeoServer WFS and merge with saved styles.
     */
    public function getFeatures(GisLayer $layer)
    {
        $geoserverConfig = \App\Models\GeoserverConfig::where('is_default', true)->first()
            ?? \App\Models\GeoserverConfig::first();

        if (!$geoserverConfig) {
            return response()->json(['error' => 'Konfigurasi GeoServer belum diatur.'], 400);
        }

        $baseUrl = rtrim($geoserverConfig->base_url, '/');
        $workspace = $geoserverConfig->workspace;
        $wfsUrl = "{$baseUrl}/{$workspace}/ows";

        try {
            $client = Http::timeout(30);
            if ($geoserverConfig->username && $geoserverConfig->password_encrypted) {
                $client->withBasicAuth($geoserverConfig->username, $geoserverConfig->password_encrypted);
            }

            $response = $client->get($wfsUrl, [
                'service' => 'WFS',
                'version' => '1.0.0',
                'request' => 'GetFeature',
                'typeName' => $layer->geoserver_layer,
                'outputFormat' => 'application/json',
            ]);

            // Fallback to anonymous request if basic auth returns 401 Unauthorized
            if ($response->status() === 401) {
                $response = Http::timeout(30)->get($wfsUrl, [
                    'service' => 'WFS',
                    'version' => '1.0.0',
                    'request' => 'GetFeature',
                    'typeName' => $layer->geoserver_layer,
                    'outputFormat' => 'application/json',
                ]);
            }

            $features = [];

            if ($response->successful()) {
                $geojson = $response->json();
                if (isset($geojson['features']) && is_array($geojson['features'])) {
                    foreach ($geojson['features'] as $f) {
                        $fid = $f['id'] ?? null;
                        if (!$fid) continue;

                        $props = $f['properties'] ?? [];
                        $name = null;

                        // Priority keys for descriptive labels
                        $priorityKeys = ['name', 'nama', 'label', 'display_name', 'nama_unsur', 'kabupaten', 'kecamatan', 'desa', 'kelurahan', 'id', 'fid'];
                        foreach ($priorityKeys as $key) {
                            foreach ($props as $propKey => $propVal) {
                                if (strtolower($propKey) === $key && is_string($propVal) && trim($propVal) !== '') {
                                    $name = $propVal;
                                    break 2;
                                }
                            }
                        }

                        // Fallback to first non-empty string attribute
                        if (!$name) {
                            foreach ($props as $propKey => $propVal) {
                                if (is_string($propVal) && trim($propVal) !== '') {
                                    $name = $propVal;
                                    break;
                                }
                            }
                        }

                        if (!$name) {
                            $name = "Petak #{$fid}";
                        }

                        $features[] = [
                            'id' => $fid,
                            'name' => $name,
                            'properties' => $props
                        ];
                    }
                }
            } else {
                return response()->json([
                    'error' => 'GeoServer WFS request failed: ' . $response->body()
                ], 500);
            }

            // Load saved styling overrides
            $savedStyles = \App\Models\GisFeatureStyle::where('gis_layer_id', $layer->id)
                ->pluck('color', 'feature_id')
                ->toArray();

            foreach ($features as &$f) {
                $f['color'] = $savedStyles[$f['id']] ?? null;
            }

            return response()->json([
                'features' => $features
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Kesalahan mengambil data dari GeoServer: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save/Reset color override for an individual feature.
     */
    public function updateFeatureStyle(Request $request, GisLayer $layer)
    {
        $validated = $request->validate([
            'feature_id' => 'required|string',
            'feature_name' => 'nullable|string',
            'color' => 'nullable|string', // nullable for resetting color
        ]);

        if (empty($validated['color'])) {
            // Delete styling override if empty (reverts to default)
            \App\Models\GisFeatureStyle::where('gis_layer_id', $layer->id)
                ->where('feature_id', $validated['feature_id'])
                ->delete();

            $msg = 'Warna petak berhasil di-reset ke default.';
        } else {
            $request->validate([
                'color' => 'regex:/^#[a-fA-F0-9]{6}$/',
            ]);

            \App\Models\GisFeatureStyle::updateOrCreate(
                [
                    'gis_layer_id' => $layer->id,
                    'feature_id' => $validated['feature_id'],
                ],
                [
                    'feature_name' => $validated['feature_name'] ?? $validated['feature_id'],
                    'color' => $validated['color'],
                ]
            );

            $msg = 'Warna petak berhasil disimpan.';
        }

        \Illuminate\Support\Facades\Cache::forget('active_gis_layers');

        ActivityLog::log(
            action: 'UPDATE',
            module: 'Layer GIS',
            description: "Mengubah warna per petak untuk layer '{$layer->display_name}': Feature ID '{$validated['feature_id']}'",
            newValue: $validated
        );

        return response()->json([
            'message' => $msg
        ]);
    }
}
