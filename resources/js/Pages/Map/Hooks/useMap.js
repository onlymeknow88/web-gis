import 'ol/ol.css';

import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { LineString, Point, Polygon } from 'ol/geom';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, getPointResolution, toLonLat } from 'ol/proj';
import { getArea, getLength } from 'ol/sphere';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Draw } from 'ol/interaction';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import Overlay from 'ol/Overlay';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import { toStringHDMS } from 'ol/coordinate';
import { unByKey } from 'ol/Observable';
const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};
const getLayerColor = (layerName) => {
    let hash = 0;
    for (let i = 0; i < layerName.length; i++) {
        hash = layerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    const s = 70 + (Math.abs(hash) % 15);
    const l = 50 + (Math.abs(hash) % 10);
    return {
        hex: hslToHex(h, s, l),
        borderHex: hslToHex(h, s, l - 20)
    };
};
const calculateScale = (view) => {
    if (!view) return null;
    const resolution = view.getResolution();
    const center = view.getCenter();
    if (resolution === undefined || !center) return null;

    const projection = view.getProjection();
    const pointResolution = getPointResolution(projection, resolution, center, 'm');

    // Target pixel width is around 170px
    const targetMeters = 170 * pointResolution;

    // Allowed scale values in meters (multiples of 3 for 3 clean segments)
    const allowedDistances = [
        3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 45, 60, 75, 90, 120, 150, 180, 210, 240, 270, 300, 450, 600, 750, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 4500, 6000, 7500, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000, 45000, 60000, 75000, 90000, 120000, 150000, 180000, 210000, 240000, 270000, 300000, 450000, 600000, 750000, 900000, 1200000, 1500000, 1800000, 2100000, 2400000, 2700000, 3000000, 4500000, 6000000
    ];

    // Find the allowed distance whose resulting pixel width is closest to 170px
    let bestDistance = allowedDistances[0];
    let bestWidth = bestDistance / pointResolution;
    let minDiff = Math.abs(bestWidth - 170);

    for (let i = 1; i < allowedDistances.length; i++) {
        const w = allowedDistances[i] / pointResolution;
        const diff = Math.abs(w - 170);
        if (diff < minDiff) {
            minDiff = diff;
            bestDistance = allowedDistances[i];
            bestWidth = w;
        }
    }

    const widthPx = bestDistance / pointResolution;
    const seg = bestDistance / 3;

    let unit = 'm';
    let d0 = 0;
    let d1 = seg;
    let d2 = seg * 2;
    let d3 = bestDistance;

    if (bestDistance >= 1000) {
        unit = 'km';
        d1 = d1 / 1000;
        d2 = d2 / 1000;
        d3 = d3 / 1000;
    }

    const formatTick = (val) => {
        if (val % 1 === 0) {
            return val.toFixed(0);
        }
        return val.toFixed(1);
    };

    return {
        width: Math.round(widthPx),
        ticks: [
            formatTick(d0),
            formatTick(d1),
            formatTick(d2),
            `${formatTick(d3)} ${unit}`
        ]
    };
};

const calculateScaleRatio = (view) => {
    if (!view) return '1 : 50.000';
    const resolution = view.getResolution();
    const center = view.getCenter();
    if (resolution === undefined || !center) return '1 : 50.000';

    const projection = view.getProjection();
    const pointResolution = getPointResolution(projection, resolution, center, 'm');

    // Standard screen DPI is 96. 1 inch = 0.0254 m. 1 px = 0.0254/96 m.
    const metersPerPixel = 0.000264583;
    const denominator = pointResolution / metersPerPixel;

    let roundedDenominator = Math.round(denominator);
    if (roundedDenominator >= 1000000) {
        roundedDenominator = Math.round(roundedDenominator / 10000) * 10000;
    } else if (roundedDenominator >= 100000) {
        roundedDenominator = Math.round(roundedDenominator / 1000) * 1000;
    } else if (roundedDenominator >= 10000) {
        roundedDenominator = Math.round(roundedDenominator / 100) * 100;
    } else {
        roundedDenominator = Math.round(roundedDenominator / 10) * 10;
    }

    return `1 : ${new Intl.NumberFormat('id-ID').format(roundedDenominator)}`;
};

export default function useMap({ layers, markers }) {
    const mapElement = useRef(null);
    const popupElement = useRef(null);
    const mapRef = useRef(null);
    const vectorSourceRef = useRef(null);
    const markersSourceRef = useRef(null);
    const overlayRef = useRef(null);
    // States
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [baseMap, setBaseMap] = useState('osm'); // osm or satellite
    const [activeLayers, setActiveLayers] = useState(
        layers.reduce((acc, layer) => {
            acc[layer.geoserver_layer] = layer.is_active;
            return acc;
        }, {})
    );
    const [measurementMode, setMeasurementMode] = useState(null); // 'line' or 'area' or null
    const [searchQuery, setSearchQuery] = useState('');
    const [pointerCoord, setPointerCoord] = useState({ lat: -3.7893, lon: 120.9213 });
    const [zoomLevel, setZoomLevel] = useState(5);
    const [scaleData, setScaleData] = useState({
        width: 170,
        ticks: ['0', '500', '1000', '1500 m']
    });
    const [scaleRatio, setScaleRatio] = useState('1 : 50.000');
    const [popupInfo, setPopupInfo] = useState(null);
    // Opacity per layer (0-100)
    const [layerOpacities, setLayerOpacities] = useState(
        layers.reduce((acc, layer) => {
            acc[layer.geoserver_layer] = 100;
            return acc;
        }, {})
    );
    // WMS layers reference to update visibility dynamically
    const wmsLayersRef = useRef({});
    const drawInteractionRef = useRef(null);
    const measureTooltipOverlaysRef = useRef([]);
    const flyTo = useCallback((longitude, latitude, zoom = 14) => {
        if (!mapRef.current) return;
        const view = mapRef.current.getView();
        view.animate({
            center: fromLonLat([longitude, latitude]),
            zoom: zoom,
            duration: 1000,
        });
    }, []);
    const closePopup = useCallback(() => {
        if (overlayRef.current) {
            overlayRef.current.setPosition(undefined);
        }
        setPopupInfo(null);
    }, []);
    // Initialize Map
    useEffect(() => {
        // Source for drawing measurements
        const vectorSource = new VectorSource();
        vectorSourceRef.current = vectorSource;
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0.08)',
                }),
                stroke: new Stroke({
                    color: '#000000',
                    width: 3,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#000000',
                    }),
                }),
            }),
            zIndex: 10,
        });
        // Source for Point Markers
        const markersSource = new VectorSource();
        markersSourceRef.current = markersSource;
        const markersLayer = new VectorLayer({
            source: markersSource,
            zIndex: 20,
        });
        // Popup overlay setup
        const overlay = new Overlay({
            element: popupElement.current,
            positioning: 'bottom-center',
            offset: [0, -35],
            autoPan: false,
        });
        overlayRef.current = overlay;
        // View settings
        const view = new View({
            center: fromLonLat([120.9213, -3.7893]), // Indonesia
            zoom: 5,
        });
        // Initial Map creation
        const initialMap = new OLMap({
            target: mapElement.current,
            controls: [],
            layers: [
                new TileLayer({
                    source: new OSM(),
                    properties: { name: 'osm' },
                }),
                vectorLayer,
                markersLayer,
            ],
            overlays: [overlay],
            view: view,
        });
        mapRef.current = initialMap;
        // Load WMS Layers
        layers.forEach((layer) => {
            let colors;
            if (layer.color) {
                const hex = layer.color;
                // Parse hex and darken by 20% for the border
                let r = parseInt(hex.slice(1, 3), 16);
                let g = parseInt(hex.slice(3, 5), 16);
                let b = parseInt(hex.slice(5, 7), 16);
                r = Math.max(0, Math.round(r * 0.8)).toString(16).padStart(2, '0');
                g = Math.max(0, Math.round(g * 0.8)).toString(16).padStart(2, '0');
                b = Math.max(0, Math.round(b * 0.8)).toString(16).padStart(2, '0');
                colors = {
                    hex: hex,
                    borderHex: `#${r}${g}${b}`
                };
            } else {
                colors = getLayerColor(layer.geoserver_layer);
            }
            const shortName = layer.geoserver_layer.includes(':')
                ? layer.geoserver_layer.split(':')[1]
                : layer.geoserver_layer;
            const fillExpr = colors.hex;
            const strokeExpr = colors.borderHex;
            // Generate single default style rule
            const fallbackRuleXml = `<Rule><PolygonSymbolizer><Fill><CssParameter name="fill">${fillExpr}</CssParameter><CssParameter name="fill-opacity">0.6</CssParameter></Fill><Stroke><CssParameter name="stroke">${strokeExpr}</CssParameter><CssParameter name="stroke-width">1.5</CssParameter></Stroke></PolygonSymbolizer><LineSymbolizer><Stroke><CssParameter name="stroke">${fillExpr}</CssParameter><CssParameter name="stroke-width">2.5</CssParameter></Stroke></LineSymbolizer><PointSymbolizer><Graphic><Mark><WellKnownName>circle</WellKnownName><Fill><CssParameter name="fill">${fillExpr}</CssParameter></Fill><Stroke><CssParameter name="stroke">#000000</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></Mark><Size>8</Size></Graphic></PointSymbolizer></Rule>`;
            const sldBody = `<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><NamedLayer><Name>${layer.geoserver_layer}</Name><UserStyle><FeatureTypeStyle>${fallbackRuleXml}</FeatureTypeStyle></UserStyle></NamedLayer><NamedLayer><Name>${shortName}</Name><UserStyle><FeatureTypeStyle>${fallbackRuleXml}</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;
            const wmsSource = new TileWMS({
                url: layer.geoserver_url,
                params: {
                    'LAYERS': layer.geoserver_layer,
                    'TILED': false,
                    'STYLES': '',
                    'sld_body': sldBody,
                    'SLD_BODY': sldBody
                },
                serverType: 'geoserver',
            });
            const wmsLayer = new TileLayer({
                source: wmsSource,
                visible: activeLayers[layer.geoserver_layer] || false,
                zIndex: 5,
            });
            initialMap.addLayer(wmsLayer);
            wmsLayersRef.current[layer.geoserver_layer] = wmsLayer;
        });
        // Click Handler for markers / coordinates
        initialMap.on('singleclick', (evt) => {
            // Check if user is actively drawing measurement - if so, ignore click triggers
            if (drawInteractionRef.current) return;
            const features = [];
            // Find clicked features (our markers vector layer)
            initialMap.forEachFeatureAtPixel(evt.pixel, (feature) => {
                if (feature.get('markerData')) {
                    features.push(feature);
                }
            });
            const coordinate = evt.coordinate;
            const lonLat = toLonLat(coordinate);
            const hdms = toStringHDMS(lonLat);
            const decimal = `${lonLat[0].toFixed(6)}° E, ${lonLat[1].toFixed(6)}° N`;
            if (features.length > 0) {
                // Marker clicked
                const markerData = features[0].get('markerData');
                const markerLonLat = [parseFloat(markerData.longitude), parseFloat(markerData.latitude)];
                const markerHdms = toStringHDMS(markerLonLat);
                const markerDecimal = `${markerLonLat[0].toFixed(6)}° E, ${markerLonLat[1].toFixed(6)}° N`;
                // Automatically zoom and center on the clicked marker first
                flyTo(markerLonLat[0], markerLonLat[1], 12);
                // Show popup after zoom animation completes to prevent autoPan conflict
                setTimeout(() => {
                    if (!mapRef.current) return;
                    setPopupInfo({
                        name: markerData.name,
                        description: markerData.description || 'Tidak ada deskripsi.',
                        hdms: markerHdms,
                        decimal: markerDecimal,
                        googleMapsCoords: `${markerLonLat[1].toFixed(6)}, ${markerLonLat[0].toFixed(6)}`,
                        layerName: markerData.layer?.display_name || '',
                        isMarker: true,
                        markerData
                    });
                    overlay.setPosition(fromLonLat(markerLonLat));
                }, 1050);
            } else {
                // Empty map clicked - close any existing popup first
                closePopup();
                // Try WMS GetFeatureInfo for visible WMS layers to display polygon info
                const activeLayersList = Object.keys(wmsLayersRef.current).filter(
                    (key) => activeLayers[key]
                );
                if (activeLayersList.length > 0) {
                    const viewResolution = view.getResolution();
                    const visibleLayerKey = activeLayersList[0]; // Query first visible layer
                    const source = wmsLayersRef.current[visibleLayerKey].getSource();
                    const url = source.getFeatureInfoUrl(
                        coordinate,
                        viewResolution,
                        'EPSG:3857',
                        { 'INFO_FORMAT': 'application/json' }
                    );
                    if (url) {
                        const proxyUrl = route('geoserver.proxy', { geoserver_url: url });
                        fetch(proxyUrl)
                            .then((res) => res.json())
                            .then((data) => {
                                if (data && data.features && data.features.length > 0) {
                                    const props = data.features[0].properties;
                                    let list = [];
                                    Object.entries(props).slice(0, 4).forEach(([k, v]) => {
                                        list.push({ key: k, val: String(v) });
                                    });
                                    setPopupInfo({
                                        name: 'Informasi Wilayah',
                                        description: 'Detail data spasial dari layer Geoserver.',
                                        hdms,
                                        decimal,
                                        googleMapsCoords: `${lonLat[1].toFixed(6)}, ${lonLat[0].toFixed(6)}`,
                                        isMarker: false,
                                        wmsInfo: list
                                    });
                                    overlay.setPosition(coordinate);
                                }
                            })
                            .catch(() => {
                                // Ignore errors, do not show popup
                            });
                    }
                }
            }
        });
        // Listen to Pointer Move for coordinates display
        const handlePointerMove = (e) => {
            if (e.dragging) return;
            const coord = toLonLat(e.coordinate);
            setPointerCoord({
                lon: coord[0],
                lat: coord[1],
            });
        };
        const updateScale = () => {
            const data = calculateScale(view);
            if (data) {
                setScaleData(data);
            }
            const ratio = calculateScaleRatio(view);
            setScaleRatio(ratio);
        };
        updateScale();

        // Listen to zoom level changes
        const handleMoveEnd = () => {
            const z = view.getZoom();
            setZoomLevel(z);
            updateScale();
        };
        initialMap.on('pointermove', handlePointerMove);
        initialMap.on('moveend', handleMoveEnd);
        // Clean up
        return () => {
            if (mapRef.current) {
                mapRef.current.un('pointermove', handlePointerMove);
                mapRef.current.un('moveend', handleMoveEnd);
                mapRef.current.setTarget(null);
            }
            measureTooltipOverlaysRef.current.forEach((t) => initialMap.removeOverlay(t));
        };
    }, [layers]);
    // Effect to update Base Map
    useEffect(() => {
        if (!mapRef.current) return;
        const layersList = mapRef.current.getLayers().getArray();
        const osmLayer = layersList.find((l) => l.get('name') === 'osm');
        if (baseMap === 'osm') {
            if (osmLayer) osmLayer.setVisible(true);
            if (wmsLayersRef.current['satellite']) {
                wmsLayersRef.current['satellite'].setVisible(false);
            }
        } else {
            // Satellite base map layer
            if (osmLayer) osmLayer.setVisible(false);
            if (wmsLayersRef.current['satellite']) {
                wmsLayersRef.current['satellite'].setVisible(true);
            } else {
                const satelliteLayer = new TileLayer({
                    source: new TileWMS({
                        url: 'https://10.102.128:21:8080/geoserver/wms',
                        params: {
                            'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
                            'TILED': true,
                        },
                    }),
                    zIndex: 0,
                });
                wmsLayersRef.current['satellite'] = satelliteLayer;
                mapRef.current.addLayer(satelliteLayer);
            }
            wmsLayersRef.current['satellite'].setVisible(true);
        }
    }, [baseMap]);
    // Effect to handle WMS Layer Visibility toggles
    useEffect(() => {
        Object.entries(activeLayers).forEach(([layerName, isVisible]) => {
            const wmsLayer = wmsLayersRef.current[layerName];
            if (wmsLayer) {
                wmsLayer.setVisible(isVisible);
            }
        });
    }, [activeLayers]);
    // Effect to draw Point Markers on Map
    useEffect(() => {
        if (!markersSourceRef.current) return;
        markersSourceRef.current.clear();
        // Filter active and matched markers
        const filteredMarkers = markers.filter((marker) => {
            const matchesSearch = marker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (marker.description && marker.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const layerActive = marker.layer_id === null || (layers.find(l => l.id === marker.layer_id) && activeLayers[layers.find(l => l.id === marker.layer_id).geoserver_layer]);
            return matchesSearch && layerActive;
        });
        filteredMarkers.forEach((marker) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([parseFloat(marker.longitude), parseFloat(marker.latitude)])),
            });
            feature.set('markerData', marker);
            let iconSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="32" height="42"><path fill="#DC2626" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`
            )}`;
            let isCustomIcon = false;
            if (marker.icon === 'office') {
                iconSrc = 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png';
                isCustomIcon = true;
            }
            if (marker.icon === 'mine') {
                iconSrc = 'https://cdn-icons-png.flaticon.com/512/2991/2991231.png';
                isCustomIcon = true;
            }
            feature.setStyle(
                new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: iconSrc,
                        scale: isCustomIcon ? 0.06 : 0.8,
                        crossOrigin: 'anonymous',
                    }),
                })
            );
            markersSourceRef.current.addFeature(feature);
        });
    }, [markers, searchQuery, activeLayers, layers]);
    const handleLayerToggle = useCallback((layerName) => {
        setActiveLayers((prev) => ({
            ...prev,
            [layerName]: !prev[layerName],
        }));
    }, []);
    const handleOpacityChange = useCallback((layerName, opacity) => {
        setLayerOpacities((prev) => ({ ...prev, [layerName]: opacity }));
        const wmsLayer = wmsLayersRef.current[layerName];
        if (wmsLayer) {
            wmsLayer.setOpacity(opacity / 100);
        }
    }, []);
    const handleMarkerClick = useCallback((marker) => {
        flyTo(parseFloat(marker.longitude), parseFloat(marker.latitude), 12);
        setTimeout(() => {
            if (!mapRef.current || !overlayRef.current) return;
            const coordinate = fromLonLat([parseFloat(marker.longitude), parseFloat(marker.latitude)]);
            const lonLat = [parseFloat(marker.longitude), parseFloat(marker.latitude)];
            const hdms = toStringHDMS(lonLat);
            const decimal = `${lonLat[0].toFixed(6)}° E, ${lonLat[1].toFixed(6)}° N`;
            setPopupInfo({
                name: marker.name,
                description: marker.description || 'Tidak ada deskripsi.',
                hdms,
                decimal,
                layerName: marker.layer?.display_name || '',
                isMarker: true,
                markerData: marker
            });
            overlayRef.current.setPosition(coordinate);
        }, 1100);
    }, [flyTo]);
    const handleZoomIn = useCallback(() => {
        if (!mapRef.current) return;
        const view = mapRef.current.getView();
        view.animate({ zoom: view.getZoom() + 1, duration: 250 });
    }, []);
    const handleZoomOut = useCallback(() => {
        if (!mapRef.current) return;
        const view = mapRef.current.getView();
        view.animate({ zoom: view.getZoom() - 1, duration: 250 });
    }, []);
    const handleFullScreen = useCallback(() => {
        const container = mapElement.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch((err) => {
                alert(`Error Fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);
    const startMeasurement = useCallback((type) => {
        if (!mapRef.current || !vectorSourceRef.current) return;
        if (drawInteractionRef.current) {
            mapRef.current.removeInteraction(drawInteractionRef.current);
        }
        setMeasurementMode(type);
        const drawType = type === 'line' ? 'LineString' : 'Polygon';
        const draw = new Draw({
            source: vectorSourceRef.current,
            type: drawType,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(0, 0, 0, 0.08)',
                }),
                stroke: new Stroke({
                    color: '#000000',
                    lineDash: [4, 8],
                    width: 3,
                }),
                image: new CircleStyle({
                    radius: 5,
                    stroke: new Stroke({
                        color: '#000000',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: '#ffffff',
                    }),
                }),
            }),
        });
        drawInteractionRef.current = draw;
        mapRef.current.addInteraction(draw);
        let measureTooltipElement;
        let measureTooltip;
        const createMeasureTooltip = () => {
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'bg-inverse-surface text-inverse-on-surface font-mono text-[10px] px-2 py-1 rounded shadow-md border border-outline-variant pointer-events-none select-none';
            measureTooltip = new Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
            });
            mapRef.current.addOverlay(measureTooltip);
            measureTooltipOverlaysRef.current.push(measureTooltip);
        };
        createMeasureTooltip();
        let listener;
        draw.on('drawstart', (evt) => {
            const sketch = evt.feature;
            let tooltipCoord = evt.coordinate;
            listener = sketch.getGeometry().on('change', (e) => {
                const geom = e.target;
                let output = '';
                if (geom instanceof Polygon) {
                    const area = getArea(geom);
                    output = area > 10000
                        ? (area / 1000000).toFixed(2) + ' km²'
                        : area.toFixed(2) + ' m²';
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof LineString) {
                    const length = getLength(geom);
                    output = length > 100
                        ? (length / 1000).toFixed(2) + ' km'
                        : length.toFixed(2) + ' m';
                    tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        });
        draw.on('drawend', () => {
            measureTooltipElement.className = 'bg-primary text-on-primary font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm pointer-events-none select-none border border-outline-variant';
            measureTooltip.setOffset([0, -7]);
            createMeasureTooltip();
            if (listener) {
                unByKey(listener);
            }
        });
    }, []);
    const cancelMeasurement = useCallback(() => {
        if (mapRef.current && drawInteractionRef.current) {
            mapRef.current.removeInteraction(drawInteractionRef.current);
            drawInteractionRef.current = null;
        }
        setMeasurementMode(null);
    }, []);
    const clearMeasurements = useCallback(() => {
        cancelMeasurement();
        if (vectorSourceRef.current) {
            vectorSourceRef.current.clear();
        }
        if (mapRef.current) {
            measureTooltipOverlaysRef.current.forEach((t) => mapRef.current.removeOverlay(t));
            measureTooltipOverlaysRef.current = [];
        }
    }, [cancelMeasurement]);
    const handleResetView = useCallback(() => {
        flyTo(120.9213, -3.7893, 5);
    }, [flyTo]);
    return {
        mapElement,
        popupElement,
        mapRef,
        isSidebarOpen,
        setIsSidebarOpen,
        baseMap,
        setBaseMap,
        activeLayers,
        setActiveLayers,
        layerOpacities,
        handleOpacityChange,
        measurementMode,
        searchQuery,
        setSearchQuery,
        pointerCoord,
        zoomLevel,
        scaleData,
        scaleRatio,
        popupInfo,
        handleLayerToggle,
        flyTo,
        handleMarkerClick,
        closePopup,
        handleZoomIn,
        handleZoomOut,
        handleFullScreen,
        startMeasurement,
        cancelMeasurement,
        clearMeasurements,
        handleResetView,
    };
}
