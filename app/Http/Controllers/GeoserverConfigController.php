<?php

namespace App\Http\Controllers;

use App\Models\GeoserverConfig;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class GeoserverConfigController extends Controller
{
    /**
     * Display the GeoServer configuration.
     */
    public function index()
    {
        $config = GeoserverConfig::where('is_default', true)->first() 
            ?? GeoserverConfig::first() 
            ?? new GeoserverConfig();

        return Inertia::render('Admin/GeoserverConfig/GeoserverConfig', [
            'config' => $config,
        ]);
    }

    /**
     * Update the GeoServer configuration in storage.
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'base_url' => 'required|url',
            'workspace' => 'required|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string',
        ]);

        $config = GeoserverConfig::where('is_default', true)->first() 
            ?? GeoserverConfig::first();

        $oldValue = $config ? $config->toArray() : [];

        $data = [
            'name' => $request->input('name'),
            'base_url' => rtrim($request->input('base_url'), '/'),
            'workspace' => $request->input('workspace'),
            'username' => $request->input('username'),
            'is_default' => true,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $data['password_encrypted'] = $request->input('password'); // encrypted cast handled by model
        }

        if ($config) {
            $config->update($data);
        } else {
            $config = GeoserverConfig::create($data);
        }

        ActivityLog::log(
            action: 'UPDATE_CONFIG',
            module: 'Konfigurasi GeoServer',
            description: "Memperbarui konfigurasi GeoServer: {$config->name}",
            oldValue: $oldValue,
            newValue: $config->toArray()
        );

        return redirect()->back()->with('message', 'Konfigurasi GeoServer berhasil disimpan.');
    }

    /**
     * Test connection to the GeoServer.
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'base_url' => 'required|url',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
        ]);

        $baseUrl = rtrim($request->input('base_url'), '/');
        // GeoServer standard WMS Capabilities test
        $testUrl = $baseUrl . '/wms?service=WMS&request=GetCapabilities';

        try {
            $client = Http::timeout(8);
            
            if ($request->filled('username')) {
                $password = $request->input('password');
                
                // If password is empty, null, or placeholder, load from DB
                if (empty($password) || $password === '********') {
                    $existing = null;
                    if ($request->filled('id')) {
                        $existing = GeoserverConfig::find($request->input('id'));
                    }
                    if (!$existing) {
                        $existing = GeoserverConfig::where('is_default', true)->first() ?? GeoserverConfig::first();
                    }
                    $password = $existing ? $existing->password_encrypted : '';
                }
                
                $client->withBasicAuth($request->input('username'), (string) ($password ?? ''));
            }

            $response = $client->get($testUrl);

            // GeoServer returns XML for WMS Capabilities
            if ($response->successful() || str_contains($response->body(), 'WMS_Capabilities')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Berhasil terhubung ke GeoServer. (HTTP ' . $response->status() . ')',
                ]);
            }

            if ($response->status() === 401) {
                return response()->json([
                    'success' => false,
                    'message' => 'Koneksi terjalin, tetapi Gagal Autentikasi. Username/Password GeoServer salah (HTTP 401).',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'GeoServer merespons dengan status error: ' . $response->status(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung ke GeoServer. Detail error: ' . $e->getMessage(),
            ]);
        }
    }
}
