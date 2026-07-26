import React from 'react';
import { MapPin, Upload, Download, Plus } from 'lucide-react';

export default function MarkersHeader({
    setIsImportModalOpen,
    openCreateModal
}) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Marker Management</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Deploy and configure geographical points of interest across the operational maps. Link markers directly to coordinate vectors and base layers.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant transition-all text-xs font-bold shadow-sm"
                >
                    <Upload className="w-3.5 h-3.5" />
                    Import CSV
                </button> */}

                <div className="relative group">
                    {/* <button
                        className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant transition-all text-xs font-bold shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button> */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant hidden group-hover:block z-30 overflow-hidden">
                        <a
                            href={route('admin.markers.export', { format: 'csv' })}
                            className="block px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-high transition border-b border-outline-variant"
                        >
                            CSV Format
                        </a>
                        <a
                            href={route('admin.markers.export', { format: 'geojson' })}
                            className="block px-4 py-2.5 text-xs font-bold text-on-surface hover:bg-surface-container-high transition"
                        >
                            GeoJSON Format
                        </a>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md text-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Marker
                </button>
            </div>
        </div>
    );
}
