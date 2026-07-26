import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

export default function MarkersFilters({
    search,
    setSearch,
    layerId,
    layers,
    handleSearchSubmit,
    handleLayerFilterChange,
    handleResetFilters
}) {
    return (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cari nama lokasi atau deskripsi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/60"
                />
            </form>

            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant mr-1">Layer:</span>
                <select
                    value={layerId}
                    onChange={(e) => handleLayerFilterChange(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px] font-semibold"
                >
                    <option value="">Semua Layer</option>
                    {layers.map((l) => (
                        <option key={l.id} value={l.id}>{l.display_name}</option>
                    ))}
                </select>
            </div>

            <button 
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                title="Reset Filters"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
    );
}
