import { Compass, Layers, MapPin, Ruler, Search, Settings, Trash2, X } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import React, { useState } from 'react';
import Modal from '@/Components/Modal';

export default function MapSidebar({
    isSidebarOpen,
    setIsSidebarOpen,
    layers,
    markers,
    activeLayers,
    handleLayerToggle,
    searchQuery,
    setSearchQuery,
    handleMarkerClick,
    measurementMode,
    startMeasurement,
    cancelMeasurement,
    clearMeasurements,
    layerOpacities,
    handleOpacityChange,
}) {
    const [showAllLayers, setShowAllLayers] = useState(false);
    const [showAllMarkers, setShowAllMarkers] = useState(false);
    const [selectedLayerInfo, setSelectedLayerInfo] = useState(null);

    // searchQuery & setSearchQuery dari useMap hook (shared dengan MapSearch di atas peta)
    const filteredMarkers = markers.filter(m =>
        m.name.toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <>
            {/* Mobile backdrop */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-64px-32px)] w-[280px] flex flex-col z-[35] bg-white border-r border-outline-variant transition-transform duration-300 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex-1 overflow-y-auto">

                    {/* ── LAYERS SECTION ── */}
                    <div className="px-[18px] py-4 border-b border-surface-container">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="w-[15px] h-[15px] text-on-surface-variant" />
                                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-on-surface-variant">
                                    Layers
                                </span>
                            </div>
                            {/* close X — mobile only */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors md:hidden"
                                aria-label="Close sidebar"
                            >
                                <X className="w-[15px] h-[15px]" />
                            </button>
                        </div>

                        {layers.length === 0 ? (
                            <p className="text-xs text-on-surface-variant italic">Belum ada layer terdaftar.</p>
                        ) : (
                            <div>
                                {(showAllLayers ? layers : layers.slice(0, 8)).map((layer) => {
                                    const isActive = activeLayers[layer.geoserver_layer] || false;
                                    const opacity = layerOpacities?.[layer.geoserver_layer] ?? 100;
                                    return (
                                        <div key={layer.id} className="py-2.5 border-b border-surface-container last:border-0">
                                            <div className="flex items-start gap-2.5">
                                                {/* Custom checkbox */}
                                                <button
                                                    onClick={() => handleLayerToggle(layer.geoserver_layer)}
                                                    className={`w-[18px] h-[18px] rounded-[0.3rem] flex items-center justify-center shrink-0 mt-[1px] border-[1.5px] transition-colors ${
                                                        isActive
                                                            ? 'bg-primary border-primary'
                                                            : 'border-outline bg-white'
                                                    }`}
                                                >
                                                    {isActive && (
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                            <path d="M20 6 9 17l-5-5"/>
                                                        </svg>
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-[13.5px] font-semibold leading-tight ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                                        {layer.display_name}
                                                    </div>
                                                    <div className="text-[11.5px] text-on-surface-variant">
                                                        {layer.layer_type || 'Vector Layer'}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedLayerInfo(layer)}
                                                    title="Detail Info Layer"
                                                    className="w-[22px] h-[22px] flex items-center justify-center text-on-surface-variant hover:text-on-surface shrink-0"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Opacity slider — shown when active */}
                                            {isActive && (
                                                <div className="flex items-center gap-2 mt-2 pl-7">
                                                    <span className="text-[11px] text-on-surface-variant shrink-0">Opacity</span>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={opacity}
                                                        onChange={(e) => handleOpacityChange?.(layer.geoserver_layer, Number(e.target.value))}
                                                        className="flex-1 h-1 accent-primary"
                                                    />
                                                    <span className="text-[11px] text-on-surface-variant w-8 text-right shrink-0 font-mono">
                                                        {opacity}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {layers.length > 8 && (
                                    <button
                                        onClick={() => setShowAllLayers(!showAllLayers)}
                                        className="w-full text-center pt-2 text-[12.5px] font-semibold text-[#004c69] hover:opacity-80 transition-opacity"
                                    >
                                        {showAllLayers ? 'Sembunyikan' : `Lihat semua layer (${layers.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── MARKERS SECTION ── */}
                    <div className="px-[18px] py-4 border-b border-surface-container">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-[15px] h-[15px] text-on-surface-variant" />
                            <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-on-surface-variant">
                                Markers
                            </span>
                        </div>

                        {/* Marker search input — shadcn/ui Input */}
                        <div className="relative mb-3">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Cari marker..."
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-8 h-8 text-[13px] border-outline-variant focus-visible:border-primary focus-visible:ring-primary/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                                    aria-label="Hapus pencarian"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {markers.length === 0 ? (
                            <p className="text-xs text-on-surface-variant italic">Belum ada marker terdaftar.</p>
                        ) : (
                            <div>
                                {/* Grid 2 kolom */}
                                <div className="grid grid-cols-1 gap-y-1 mb-3">
                                    {(showAllMarkers ? filteredMarkers : filteredMarkers.slice(0, 10)).map((marker) => (
                                        <button
                                            key={marker.id}
                                            onClick={() => handleMarkerClick(marker)}
                                            className="flex items-center gap-2.5 text-left group w-full px-2.5 py-2 hover:bg-surface-container hover:shadow-sm rounded-lg transition-all duration-150"
                                        >
                                            {/* SVG pin dot */}
                                            <svg className="w-[18px] h-[18px] shrink-0 transform group-hover:scale-110 transition-transform duration-150" viewBox="0 0 24 24"
                                                fill={marker.color || '#2563eb'}
                                                stroke="white" strokeWidth="1"
                                            >
                                                <path d="M12 21s7-7.58 7-12A7 7 0 0 0 5 9c0 4.42 7 12 7 12Z"/>
                                                <circle cx="12" cy="9" r="2.4" fill="white"/>
                                            </svg>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[12.5px] font-semibold text-on-surface group-hover:text-primary truncate leading-tight transition-colors">
                                                    {marker.name}
                                                </div>
                                                <div className="text-[10.5px] text-on-surface-variant truncate mt-0.5">
                                                    {marker.marker_type || 'Marker'}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                {filteredMarkers.length > 10 && (
                                    <button
                                        onClick={() => setShowAllMarkers(!showAllMarkers)}
                                        className="text-[12.5px] font-semibold text-[#004c69] hover:opacity-80 transition-opacity"
                                    >
                                        {showAllMarkers
                                            ? 'Sembunyikan'
                                            : `Lihat semua marker (${filteredMarkers.length})`}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── TOOLS SECTION ── */}
                    <div className="px-[18px] py-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <svg className="w-[15px] h-[15px] text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z"/>
                            </svg>
                            <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-on-surface-variant">
                                Tools
                            </span>
                        </div>

                        <nav className="space-y-0.5">
                            <button
                                onClick={() => startMeasurement('line')}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                                    measurementMode === 'line'
                                        ? 'bg-primary text-on-primary'
                                        : 'text-on-surface hover:bg-surface-container'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                </svg>
                                Ukur Jarak
                            </button>

                            <button
                                onClick={() => startMeasurement('area')}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                                    measurementMode === 'area'
                                        ? 'bg-primary text-on-primary'
                                        : 'text-on-surface hover:bg-surface-container'
                                }`}
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
                                </svg>
                                Ukur Luas
                            </button>

                            {measurementMode && (
                                <button
                                    onClick={cancelMeasurement}
                                    className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-[11px] font-bold text-destructive-red bg-rose-50 hover:bg-rose-100 uppercase tracking-wider border border-destructive-red/10 transition-all"
                                >
                                    Batal Gambar
                                </button>
                            )}

                            <button
                                onClick={clearMeasurements}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13.5px] font-medium text-destructive-red hover:bg-rose-50 transition-all"
                            >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                Hapus Hasil Ukur
                            </button>
                        </nav>
                    </div>
                </div>
            </aside>

            {/* Layer Info Modal */}
            <Modal show={!!selectedLayerInfo} onClose={() => setSelectedLayerInfo(null)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                            <Layers className="w-4 h-4 text-primary" />
                            Detail Informasi Layer
                        </h3>
                        <button
                            onClick={() => setSelectedLayerInfo(null)}
                            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-4 space-y-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">Nama Tampilan</span>
                            <span className="text-[13.5px] font-semibold text-on-surface">{selectedLayerInfo?.display_name}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">Workspace/Layer (GeoServer)</span>
                            <span className="text-[12px] font-mono bg-surface-container px-2.5 py-1.5 rounded block mt-1 break-all select-all">{selectedLayerInfo?.geoserver_layer}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">GeoServer URL (WMS)</span>
                            <span className="text-[11.5px] font-mono bg-surface-container px-2.5 py-1.5 rounded block mt-1 break-all select-all text-on-surface-variant">{selectedLayerInfo?.geoserver_url}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">Deskripsi</span>
                            <p className="text-[13px] text-on-surface-variant leading-relaxed mt-1">{selectedLayerInfo?.description || 'Tidak ada deskripsi untuk layer ini.'}</p>
                        </div>
                        {selectedLayerInfo?.color && (
                            <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant block">Warna Styling Utama</span>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="w-5 h-5 rounded border border-outline-variant" style={{ backgroundColor: selectedLayerInfo.color }} />
                                    <span className="text-[12.5px] font-mono font-medium">{selectedLayerInfo.color}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setSelectedLayerInfo(null)}
                            className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-[12.5px] font-semibold text-on-surface rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
