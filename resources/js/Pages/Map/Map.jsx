import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import useMap from './Hooks/useMap';
import MapHeader from './Partials/MapHeader';
import MapSidebar from './Partials/MapSidebar';
import MapFooter from './Partials/MapFooter';
import MapPopup from './Partials/MapPopup';
import MapControls from './Partials/MapControls';
import MapHUD from './Partials/MapHUD';
import MapSearch from './Partials/MapSearch';
import MapMinimap from './Partials/MapMinimap';

export default function MapPage({ layers, markers, geoserver }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const {
        mapElement,
        popupElement,
        mapRef,
        isSidebarOpen,
        setIsSidebarOpen,
        activeLayers,
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
        handleMarkerClick,
        closePopup,
        handleZoomIn,
        handleZoomOut,
        handleFullScreen,
        startMeasurement,
        cancelMeasurement,
        clearMeasurements,
        handleResetView,
    } = useMap({ layers, markers });

    const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    alert('Koordinat berhasil disalin ke clipboard!');
                })
                .catch((err) => {
                    fallbackCopyToClipboard(text);
                });
        } else {
            fallbackCopyToClipboard(text);
        }
    };

    const fallbackCopyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Koordinat berhasil disalin ke clipboard!');
        } catch (err) {
            alert('Gagal menyalin koordinat.');
        }
        document.body.removeChild(textArea);
    };

    return (
        <div className="min-h-screen bg-surface text-on-surface font-sans antialiased overflow-hidden flex flex-col h-screen">
            <Head title="Interactive WebGIS Map" />

            {/* 1. TOP NAVIGATION BAR */}
            <MapHeader
                user={user}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex flex-1 pt-16 h-[calc(100vh-64px)] relative">

                {/* 2. LAYER / MARKER PANEL */}
                <MapSidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    layers={layers}
                    markers={markers}
                    activeLayers={activeLayers}
                    handleLayerToggle={handleLayerToggle}
                    layerOpacities={layerOpacities}
                    handleOpacityChange={handleOpacityChange}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleMarkerClick={handleMarkerClick}
                    measurementMode={measurementMode}
                    startMeasurement={startMeasurement}
                    cancelMeasurement={cancelMeasurement}
                    clearMeasurements={clearMeasurements}
                />

                {/* 3. MAP VIEWPORT */}
                <main className={`flex-1 h-full relative bg-surface-dim overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>

                    {/* Search bar (top center) */}
                    <MapSearch
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {/* Controls (top right) */}
                    <MapControls
                        handleZoomIn={handleZoomIn}
                        handleZoomOut={handleZoomOut}
                        handleFullScreen={handleFullScreen}
                        handleResetView={handleResetView}
                    />

                    {/* HUD (bottom left) */}
                    <MapHUD
                        pointerCoord={pointerCoord}
                        zoomLevel={zoomLevel}
                        scaleRatio={scaleRatio}
                    />

                    {/* Minimap fungsional */}
                    <MapMinimap mapRef={mapRef} />

                    {/* Scale bar (bottom right) */}
                    <div className="absolute bottom-4 right-4 z-30 bg-white/90 backdrop-blur-sm rounded-md px-3 py-2 shadow-sm w-fit">
                        {/* Tick labels */}
                        <div 
                            className="flex justify-between font-mono text-[10px] text-on-surface-variant mb-1 whitespace-nowrap"
                            style={{ width: `${scaleData.width}px` }}
                        >
                            {scaleData.ticks.map((tick, index) => (
                                <span key={index}>{tick}</span>
                            ))}
                        </div>
                        {/* Striped bar */}
                        <div 
                            className="flex h-[6px] border-x border-b border-on-surface"
                            style={{ width: `${scaleData.width}px` }}
                        >
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className="flex-1"
                                    style={{ background: i % 2 === 0 ? '#191c1e' : '#ffffff' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* OpenLayers map node */}
                    <div ref={mapElement} className="w-full h-full" id="map" />

                    {/* Stable Popup Overlay container for OpenLayers */}
                    <div ref={popupElement} className="absolute z-50 pointer-events-auto" style={{ display: popupInfo ? 'block' : 'none' }} />

                    {/* Popup overlay */}
                    <MapPopup
                        popupElement={popupElement}
                        popupInfo={popupInfo}
                        closePopup={closePopup}
                        copyToClipboard={copyToClipboard}
                    />
                </main>
            </div>

            {/* 4. STATUS FOOTER */}
            <MapFooter />
        </div>
    );
}
