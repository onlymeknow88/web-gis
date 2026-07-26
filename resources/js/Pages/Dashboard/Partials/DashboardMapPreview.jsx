import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Map, ArrowRight, Plus, Minus } from 'lucide-react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

export default function DashboardMapPreview() {
    const mapElement = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapElement.current || mapRef.current) return;

        const map = new OLMap({
            target: mapElement.current,
            layers: [
                new TileLayer({ source: new OSM() }),
            ],
            view: new View({
                center: fromLonLat([117.0, -2.5]), // Indonesia center
                zoom: 5,
                minZoom: 3,
                maxZoom: 18,
            }),
            controls: [], // disable default OL controls
        });

        mapRef.current = map;

        return () => {
            map.setTarget(undefined);
            mapRef.current = null;
        };
    }, []);

    const handleZoomIn = () => {
        const view = mapRef.current?.getView();
        if (view) view.animate({ zoom: view.getZoom() + 1, duration: 250 });
    };

    const handleZoomOut = () => {
        const view = mapRef.current?.getView();
        if (view) view.animate({ zoom: view.getZoom() - 1, duration: 250 });
    };

    return (
        <div className="bg-white border border-outline-variant rounded-sm overflow-hidden">
            {/* Panel head */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-[15px] font-bold text-on-surface">Peta Preview</span>
                </div>
                <Link
                    href={route('map')}
                    className="flex items-center gap-1 text-[13px] font-semibold text-[#004c69] hover:opacity-80 transition-opacity"
                >
                    Buka Peta
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Map container */}
            <div className="p-5">
                <div className="relative h-[320px] rounded-sm overflow-hidden">
                    {/* OpenLayers map node */}
                    <div ref={mapElement} className="w-full h-full" />

                    {/* Zoom controls */}
                    <div className="absolute top-3 right-3 flex flex-col z-10 rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                        <button
                            onClick={handleZoomIn}
                            className="w-[34px] h-[34px] bg-white flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant"
                            title="Zoom in"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="w-[34px] h-[34px] bg-white flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
                            title="Zoom out"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scale label */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-on-surface z-10 pointer-events-none">
                        OpenStreetMap
                    </div>
                </div>
            </div>
        </div>
    );
}
