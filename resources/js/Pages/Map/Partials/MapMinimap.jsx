import React, { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export default function MapMinimap({ mapRef }) {
    const minimapEl = useRef(null);
    const minimapRef = useRef(null);

    useEffect(() => {
        if (!minimapEl.current) return;

        // Create minimap OL instance
        const minimap = new OLMap({
            target: minimapEl.current,
            layers: [new TileLayer({ source: new OSM() })],
            controls: [],
            interactions: [],
            view: new View({
                center: [120.9213, -3.7893],
                zoom: 2,
                projection: 'EPSG:3857',
            }),
        });

        minimapRef.current = minimap;

        // Sync minimap center when main map view changes
        let listenerKey = null;
        const syncMinimap = () => {
            const mainMap = mapRef?.current;
            if (!mainMap) return;
            const mainView = mainMap.getView();
            const mainCenter = mainView.getCenter();
            const mainZoom = mainView.getZoom();
            if (mainCenter) {
                minimap.getView().setCenter(mainCenter);
                // Minimap zoom = main zoom - 4 (always more zoomed out)
                minimap.getView().setZoom(Math.max(1, (mainZoom || 5) - 4));
            }
        };

        // Start listening once main map is ready
        const waitForMainMap = setInterval(() => {
            const mainMap = mapRef?.current;
            if (!mainMap) return;
            clearInterval(waitForMainMap);

            // Initial sync
            syncMinimap();

            // Listen to view changes
            listenerKey = mainMap.getView().on('change', syncMinimap);
        }, 100);

        return () => {
            clearInterval(waitForMainMap);
            if (listenerKey) {
                import('ol/Observable').then(({ unByKey }) => unByKey(listenerKey));
            }
            minimap.setTarget(undefined);
            minimapRef.current = null;
        };
    }, []);

    return (
        <div
            className="absolute bottom-16 right-4 z-[25] w-[150px] h-[110px] rounded-lg overflow-hidden border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] hidden md:block cursor-pointer"
            title="Minimap — klik untuk kembali ke posisi ini"
        >
            {/* OL minimap target */}
            <div ref={minimapEl} className="w-full h-full" />

            {/* Viewport indicator box overlay */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: '34%',
                    height: '30%',
                    top: '35%',
                    left: '33%',
                    border: '2px solid rgba(255,255,255,0.9)',
                    background: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                }}
            />
        </div>
    );
}
