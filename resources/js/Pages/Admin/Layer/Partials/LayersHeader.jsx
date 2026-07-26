import React from 'react';
import { Filter, Plus } from 'lucide-react';

export default function LayersHeader({
    layers,
    status,
    handleStatusFilterChange,
    openAddModal
}) {
    const activeCount = layers.data ? layers.data.filter(l => l.is_active).length : 0;
    const totalCount = layers.total || 0;

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Layer Management</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Configure and deploy spatial data layers across the Site Alpha GIS ecosystem. Manage visibility, server endpoints, and operational status.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => handleStatusFilterChange(status === 'active' ? '' : 'active')}
                    className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant transition-all text-xs font-bold"
                >
                    <Filter className="w-3.5 h-3.5" />
                    {status === 'active' ? 'Show All' : 'Active Only'}
                </button>
                <button
                    onClick={openAddModal}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md text-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add New Layer
                </button>
            </div>
        </div>
    );
}
