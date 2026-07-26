<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\GisLayerController;
use App\Models\GisLayer;

$layer = GisLayer::find(3); // Indonesia:AMC_CCoW_Bdy
if (!$layer) {
    echo "Layer ID 3 not found!\n";
    exit(1);
}

echo "Testing GisLayerController@getFeatures for layer: " . $layer->display_name . "\n";

$controller = new GisLayerController();
$response = $controller->getFeatures($layer);

echo "Response Status: " . $response->status() . "\n";
$data = $response->getData(true);
if (isset($data['features'])) {
    echo "Features count: " . count($data['features']) . "\n";
    if (count($data['features']) > 0) {
        echo "First feature name: " . $data['features'][0]['name'] . "\n";
        echo "First feature color: " . ($data['features'][0]['color'] ?? 'NULL') . "\n";
    }
} else {
    echo "Error response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
}
