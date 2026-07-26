<?php

namespace App\Http\Controllers;

use App\Models\GisMarker;
use App\Models\GisLayer;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GisMarkerController extends Controller
{
    /**
     * Display a listing of markers.
     */
    public function index(Request $request)
    {
        $query = GisMarker::query()->with(['layer', 'creator']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('layer_id')) {
            $query->where('layer_id', $request->input('layer_id'));
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

        $markers = $query->orderBy('id', 'desc')
            ->paginate($limit)
            ->withQueryString();

        $layers = GisLayer::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get();

        return Inertia::render('Admin/Marker/Markers', [
            'markers' => $markers,
            'layers' => $layers,
            'filters' => $request->only(['search', 'layer_id', 'limit']),
        ]);
    }

    /**
     * Store a newly created marker in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'longitude' => 'required|numeric|between:-180,180',
            'latitude' => 'required|numeric|between:-90,90',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'layer_id' => 'nullable|exists:gis_layers,id',
            'is_active' => 'required|boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $marker = GisMarker::create($validated);

        \Illuminate\Support\Facades\Cache::forget('active_gis_markers');

        ActivityLog::log(
            action: 'CREATE',
            module: 'Marker GIS',
            description: "Membuat marker baru: {$marker->name}",
            newValue: $marker->toArray()
        );

        return redirect()->back()->with('message', 'Marker berhasil ditambahkan.');
    }

    /**
     * Update the specified marker in storage.
     */
    public function update(Request $request, GisMarker $marker)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'longitude' => 'required|numeric|between:-180,180',
            'latitude' => 'required|numeric|between:-90,90',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'layer_id' => 'nullable|exists:gis_layers,id',
            'is_active' => 'required|boolean',
        ]);

        $oldValue = $marker->toArray();
        $marker->update($validated);

        \Illuminate\Support\Facades\Cache::forget('active_gis_markers');

        ActivityLog::log(
            action: 'UPDATE',
            module: 'Marker GIS',
            description: "Memperbarui marker: {$marker->name}",
            oldValue: $oldValue,
            newValue: $marker->toArray()
        );

        return redirect()->back()->with('message', 'Marker berhasil diperbarui.');
    }

    /**
     * Remove the specified marker from storage.
     */
    public function destroy(GisMarker $marker)
    {
        $oldValue = $marker->toArray();
        $marker->delete();

        \Illuminate\Support\Facades\Cache::forget('active_gis_markers');

        ActivityLog::log(
            action: 'DELETE',
            module: 'Marker GIS',
            description: "Menghapus marker: {$oldValue['name']}",
            oldValue: $oldValue
        );

        return redirect()->back()->with('message', 'Marker berhasil dihapus.');
    }

    /**
     * Export markers to CSV or GeoJSON.
     */
    public function export(Request $request)
    {
        $format = $request->input('format', 'csv');
        $markers = GisMarker::with('layer')->get();

        ActivityLog::log(
            action: 'EXPORT',
            module: 'Marker GIS',
            description: "Mengekspor marker ke format " . strtoupper($format)
        );

        if ($format === 'geojson') {
            $features = [];
            foreach ($markers as $marker) {
                $features[] = [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'Point',
                        'coordinates' => [(float)$marker->longitude, (float)$marker->latitude],
                    ],
                    'properties' => [
                        'id' => $marker->id,
                        'name' => $marker->name,
                        'description' => $marker->description,
                        'icon' => $marker->icon,
                        'layer' => $marker->layer ? $marker->layer->display_name : null,
                        'is_active' => $marker->is_active,
                    ]
                ];
            }

            $geojson = [
                'type' => 'FeatureCollection',
                'features' => $features
            ];

            return response()->json($geojson)
                ->header('Content-Type', 'application/geo+json')
                ->header('Content-Disposition', 'attachment; filename="markers.geojson"');
        }

        // CSV export
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="markers.csv"',
        ];

        $callback = function() use ($markers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['nama_lokasi', 'longitude', 'latitude', 'deskripsi', 'layer']);

            foreach ($markers as $marker) {
                fputcsv($file, [
                    $marker->name,
                    $marker->longitude,
                    $marker->latitude,
                    $marker->description,
                    $marker->layer ? $marker->layer->display_name : ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import markers from CSV.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'layer_id' => 'nullable|exists:gis_layers,id',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $handle = fopen($path, 'r');
        if ($handle === false) {
            return redirect()->back()->withErrors(['error' => 'Gagal membuka file CSV.']);
        }
        
        // Read header
        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);
            return redirect()->back()->withErrors(['error' => 'File CSV kosong atau tidak valid.']);
        }

        // Sanitize headers
        $header = array_map(function($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h)));
        }, $header);

        $nameIdx = array_search('nama_lokasi', $header);
        $longIdx = array_search('longitude', $header);
        $latIdx = array_search('latitude', $header);
        $descIdx = array_search('deskripsi', $header);

        if ($nameIdx === false || $longIdx === false || $latIdx === false) {
            fclose($handle);
            return redirect()->back()->withErrors([
                'error' => 'Format CSV salah. Header harus memiliki kolom: nama_lokasi, longitude, latitude.'
            ]);
        }

        $importedCount = 0;
        $errors = [];
        $rowNum = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNum++;
            
            $name = isset($row[$nameIdx]) ? trim($row[$nameIdx]) : '';
            $longitude = isset($row[$longIdx]) ? trim($row[$longIdx]) : '';
            $latitude = isset($row[$latIdx]) ? trim($row[$latIdx]) : '';
            $description = isset($row[$descIdx]) ? trim($row[$descIdx]) : '';

            if (empty($name) || $longitude === '' || $latitude === '') {
                $errors[] = "Baris {$rowNum}: Kolom nama_lokasi, longitude, atau latitude tidak boleh kosong.";
                continue;
            }

            $longitude = (float)$longitude;
            $latitude = (float)$latitude;

            if ($longitude < -180 || $longitude > 180 || $latitude < -90 || $latitude > 90) {
                $errors[] = "Baris {$rowNum}: Koordinat tidak valid (Lat -90 s/d 90, Long -180 s/d 180).";
                continue;
            }

            GisMarker::create([
                'name' => $name,
                'longitude' => $longitude,
                'latitude' => $latitude,
                'description' => $description,
                'layer_id' => $request->input('layer_id'),
                'is_active' => true,
                'created_by' => auth()->id(),
            ]);

            $importedCount++;
        }

        fclose($handle);

        \Illuminate\Support\Facades\Cache::forget('active_gis_markers');

        ActivityLog::log(
            action: 'IMPORT',
            module: 'Marker GIS',
            description: "Mengimpor {$importedCount} marker dari file CSV."
        );

        if (count($errors) > 0) {
            return redirect()->back()->with([
                'message' => "Berhasil mengimpor {$importedCount} marker. Beberapa baris dilewati karena error.",
                'import_warnings' => $errors
            ]);
        }

        return redirect()->back()->with('message', "Berhasil mengimpor {$importedCount} marker.");
    }
}
