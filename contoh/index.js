//Index.js full
// Import OpenLayers Libraries
import 'ol/ol.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat, transform, toLonLat, transformExtent} from 'ol/proj';
import TileWMS from 'ol/source/TileWMS';
import {toStringHDMS} from 'ol/coordinate';

// Import untuk Measure
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import {Draw, Modify, Select, Snap} from 'ol/interaction';
import {getArea, getLength} from 'ol/sphere';
import {LineString, Polygon} from 'ol/geom';
import {unByKey} from 'ol/Observable';

// Import untuk Multi Marker
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import {Icon} from 'ol/style';

// ======== SETUP AWAL PETA ========

// Koordinat pusat peta (Indonesia)
var long = 120.9213;
var lat = -3.7893;
var longlat = transform([long, lat], 'EPSG:4326', 'EPSG:3857');

// Setup View
var view = new View({
    center: longlat,
    zoom: 5,
    rotation: 0
});

// ======== LAYER VECTOR UNTUK MEASURE ========

var vector = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: '#000',
            width: 2
        }),
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({
                color: '#000'
            })
        })
    })
});

// ======== POPUP OVERLAY ========

var container_pop = document.getElementById('popup');
var content_pop = document.getElementById('popup-content');
var closer_pop = document.getElementById('popup-closer');

var overlay = new Overlay({
    element: container_pop,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

// ======== BASE MAP ========

var OSM_ = new TileLayer({source: new OSM()});

// ======== INISIALISASI MAP ========

var map = new Map({
    target: 'map',
    layers: [OSM_, vector],
    overlays: [overlay],
    loadTilesWhileInteracting: true,
    view: view
});

// ======== EVENT HANDLERS ========

// 1. BASE MAP 2 (Satellite)
$('body').delegate('#satelite', 'change', function(e) {
    var check_ = $(this).is(':checked');
    if (check_) {
        if (window['base_map']) {
            window['base_map'].setVisible(true);
        } else {
            var layers_ = new TileLayer({
                source: new TileWMS({
                    url: 'https://ahocevar.com/geoserver/wms',
                    params: {
                        'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
                        'TILED': true
                    }
                })
            });
            window['base_map'] = layers_;
            map.addLayer(layers_);
        }
    } else {
        window['base_map'].setVisible(false);
    }
    e.preventDefault();
});

// 2. SHOW LAYER FROM GEOSERVER
$('body').delegate('.LayerAction', 'change', function(e) {
    var urlToGeo = 'http://10.102.128.21:8080/geoserver/Indonesia/wms';
    var value = $(this).val();
    var check_ = $(this).is(':checked');
    console.log(">> " + value);
    if (check_) {
        if (window['layer_' + value]) {
            window['layer_' + value].setVisible(true);
        } else {
            var layerss = 'Indonesia:' + value;
            var wms_source = new TileWMS({
                url: urlToGeo,
                params: {
                    'LAYERS': layerss,
                    'TILED': true
                }
            });
            var dt_layer = new TileLayer({source: wms_source});
            map.addLayer(dt_layer);
            window['layer_' + value] = dt_layer;
        }
    } else {
        window['layer_' + value].setVisible(false);
    }
    e.preventDefault();
});

// ======== MEASURE FUNCTIONS ========

var draw, sketch, helpTooltipElement, helpTooltip, measureTooltipElement, measureTooltip;

var formatLength = function(line) {
    var length = getLength(line);
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
};

function measure() {
    var type = 'LineString';
    draw = new Draw({
        source: vector.getSource(),
        type: type
    });
    map.addInteraction(draw);
    createMeasureTooltip();
    
    var listener;
    draw.on('drawstart', function(evt) {
        sketch = evt.feature;
        var tooltipCoord = evt.coordinate;
        listener = sketch.getGeometry().on('change', function(evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });
    
    draw.on('drawend', function() {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
        unByKey(listener);
    });
}

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

// 3. UKUR JARAK EVENT
$('body').delegate('#ukur_jarak', 'change', function(e) {
    var check_ = $(this).is(':checked');
    if (check_) {
        measure();
    } else {
        map.removeInteraction(draw);
    }
    e.preventDefault();
});

// 4. FULL SCREEN
$('body').delegate('#full_screen', 'click', function(e) {
    var elem = document.getElementById('map');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
    e.preventDefault();
});

// 5. PUSATKAN PETA
$('body').delegate('#PusatKan', 'click', function(e) {
    view.animate({zoom: 5}, {center: longlat}, {rotation: 0});
    e.preventDefault();
});

// 6. POPUP EVENT
closer_pop.onclick = function() {
    overlay.setPosition(undefined);
    closer_pop.blur();
    return false;
};

map.on('singleclick', function(evt) {
    overlay.setPosition(undefined);
    var coordinate = evt.coordinate;
    var hdms = toStringHDMS(toLonLat(coordinate));
    closer_pop.blur();
    content_pop.innerHTML = 'Koordinat: ' + hdms;
    overlay.setPosition(coordinate);
});

// 7. PRINT MAP
$('body').delegate('#print', 'click', function(e) {
    window.print();
    e.preventDefault();
});

// ======== MULTI MARKER FUNCTIONS ========

function Multi_marker(long = long, lat = lat, lokasi = "") {
    var img_marker = 'https://openlayers.org/en/latest/examples/data/icon.png';
    
    var iconFeature = new Feature({
        geometry: new Point(transform([long, lat], 'EPSG:4326', 'EPSG:3857')),
        name: lokasi,
        population: 4000,
        rainfall: 500
    });
    
    var iconStyle = new Style({
        image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: img_marker
        })
    });
    
    iconFeature.setStyle(iconStyle);
    return iconFeature;
}

// 8. MULTI MARKER EVENT
$('body').delegate('.Multi_marker', 'change', function(e) {
    var check_ = $(this).is(':checked');
    var value = "multi_marker";
    var iconFeature = new Array();
    
    if (check_) {
        var data_koordinat = [
            {long: 110.841, lat: -7.862, lokasi: 'Jawa Tengah'},
            {long: 120.9213, lat: -3.7893, lokasi: 'Indonesia'}
        ];
        
        $.each(data_koordinat, function(t, y) {
            var long = parseFloat(y.long);
            var lat = parseFloat(y.lat);
            var lokasi = y.lokasi;
            iconFeature.push(Multi_marker(long, lat, lokasi));
        });
        
        var vectorSource = new VectorSource({
            features: iconFeature
        });
        
        var vectorLayer = new VectorLayer({
            source: vectorSource
        });
        
        if (window['layer_' + value]) {
            window['layer_' + value].setVisible(true);
        } else {
            window['layer_' + value] = vectorLayer;
            map.addLayer(vectorLayer);
        }
    } else {
        window['layer_' + value].setVisible(false);
    }
});