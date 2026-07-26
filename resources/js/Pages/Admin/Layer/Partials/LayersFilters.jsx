import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

export default function LayersFilters({
    search,
    setSearch,
    status,
    handleStatusFilterChange,
    handleSearchSubmit
}) {
    return (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/60" 
                    placeholder="Filter by ID, Name or GeoServer path..." 
                    type="text"
                />
            </form>
            
            <select 
                value={status}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px] font-semibold"
            >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
            </select>

            <button 
                type="button"
                onClick={() => {
                    setSearch('');
                    handleStatusFilterChange('');
                }}
                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors"
                title="Reset Filters"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
        </div>
    );
}
