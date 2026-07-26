import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import {
    Layers,
    Compass,
    AlertTriangle,
    Database,
    Activity,
    MapPin,
    Edit2,
    Trash2,
    Users
} from 'lucide-react';
export default function LayersTable({
    layers,
    search,
    status,
    limit,
    handleLimitChange,
    isGenerating,
    handleToggleStatus,
    handleGenerateMarker,
    openEditModal,
    openAccessModal,
    handleDelete
}) {
    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-on-surface-variant">
                    #LYR-{String(getValue()).padStart(3, '0')}
                </span>
            )
        },
        {
            accessorKey: 'display_name',
            header: 'Display Name',
            cell: ({ row }) => {
                const layer = row.original;
                let LayerIcon = Layers;
                let iconColorClass = "text-primary";
                let iconBgClass = "bg-primary-fixed";
                const nameLower = layer.display_name.toLowerCase();
                if (nameLower.includes('topo') || nameLower.includes('elevation') || nameLower.includes('contour')) {
                    LayerIcon = Compass;
                    iconColorClass = "text-primary";
                    iconBgClass = "bg-primary-fixed";
                } else if (nameLower.includes('seismic') || nameLower.includes('hazard') || nameLower.includes('warning') || nameLower.includes('fault')) {
                    LayerIcon = AlertTriangle;
                    iconColorClass = "text-amber-700";
                    iconBgClass = "bg-amber-50 border border-amber-200/50";
                } else if (nameLower.includes('archive') || nameLower.includes('history') || nameLower.includes('old')) {
                    LayerIcon = Database;
                    iconColorClass = "text-secondary";
                    iconBgClass = "bg-surface-container-high";
                } else if (nameLower.includes('active') || nameLower.includes('live') || nameLower.includes('realtime')) {
                    LayerIcon = Activity;
                    iconColorClass = "text-success-emerald";
                    iconBgClass = "bg-success-emerald/10 border border-success-emerald/20";
                }
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${iconBgClass}`}>
                            <LayerIcon className={`w-4 h-4 ${iconColorClass}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-bold text-on-surface leading-none">{layer.display_name}</span>
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 inline-block"
                                    style={{ backgroundColor: layer.color || '#3b82f6' }}
                                    title={layer.color ? `Warna manual: ${layer.color}` : 'Warna default'}
                                />
                            </div>
                            <span className="text-[11px] text-on-surface-variant font-normal leading-normal">{layer.description || 'No description provided'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'geoserver_layer',
            header: 'GeoServer Layer',
            cell: ({ getValue }) => (
                <span className="font-mono text-xs text-on-secondary-fixed-variant">
                    {getValue()}
                </span>
            )
        },
        {
            id: 'permitted_users',
            header: 'Akses Pengguna',
            cell: ({ row }) => {
                const layer = row.original;
                const users = layer.permitted_users || [];
                if (users.length === 0) {
                    return (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            HANYA ADMIN
                        </span>
                    );
                }

                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {users.slice(0, 2).map((user) => (
                            <span
                                key={user.id}
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 max-w-[90px] truncate"
                                title={`${user.name} (${user.email})`}
                            >
                                {user.name}
                            </span>
                        ))}
                        {users.length > 2 && (
                            <span
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant cursor-help"
                                title={users.slice(2).map(u => `${u.name} (${u.email})`).join(', ')}
                            >
                                +{users.length - 2} lagi
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'is_active',
            header: () => <div className="text-center">Status</div>,
            cell: ({ row }) => {
                const layer = row.original;
                return (
                    <div className="text-center">
                        <button
                            onClick={() => handleToggleStatus(layer)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${layer.is_active
                                    ? 'bg-success-emerald/10 text-success-emerald border-success-emerald/20 hover:bg-success-emerald/25'
                                    : 'bg-surface-variant text-on-surface-variant border-outline-variant hover:bg-outline-variant/50'
                                }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${layer.is_active ? 'bg-success-emerald animate-pulse' : 'bg-outline'}`}></span>
                            {layer.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const layer = row.original;
                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <button
                            onClick={() => openAccessModal(layer)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Atur Akses Pengguna"
                        >
                            <Users className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleGenerateMarker(layer)}
                            disabled={isGenerating === layer.id}
                            className="p-1.5 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-all disabled:opacity-50"
                            title="Buat Marker Pusat Layer Otomatis"
                        >
                            <MapPin className={`w-3.5 h-3.5 ${isGenerating === layer.id ? 'animate-bounce' : ''}`} />
                        </button>
                        <button
                            onClick={() => openEditModal(layer)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Edit Layer"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete(layer)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-on-surface-variant hover:text-destructive-red transition-all"
                            title="Delete Layer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            }
        }
    ], [isGenerating, handleToggleStatus, handleGenerateMarker, openEditModal, openAccessModal, handleDelete]);
    const table = useReactTable({
        data: layers.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: layers.last_page || 1,
    });
    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant text-[11px] font-bold tracking-wider uppercase text-left">
                                {headerGroup.headers.map(header => {
                                    // Custom widths or styles based on column ID
                                    let thClass = "py-4 px-6";
                                    if (header.id === 'id') thClass += " w-16";
                                    if (header.id === 'is_active') thClass += " w-32";
                                    if (header.id === 'permitted_users') thClass += " w-52";
                                    if (header.id === 'actions') thClass += " w-40";
                                    return (
                                        <th key={header.id} className={thClass}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-10 px-6 text-center text-xs text-on-surface-variant italic">
                                    No layers found.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="py-4 px-6">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination controls */}
            <div className="bg-surface-container-low px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs text-on-surface-variant">
                        Showing <span className="text-on-surface font-bold">{(layers.current_page - 1) * layers.per_page + 1} - {Math.min(layers.current_page * layers.per_page, layers.total)}</span> of <span className="text-on-surface font-bold">{layers.total}</span> layers
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tampilkan:</span>
                        <select
                            value={limit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-bold cursor-pointer"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {layers.links && layers.links.map((link, idx) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        return (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, { search, status, limit }, { preserveState: true })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${link.active
                                        ? 'bg-primary border-primary text-on-primary'
                                        : link.url
                                            ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                                    }`}
                                dangerouslySetInnerHTML={{
                                    __html: isPrev ? '&larr; Prev' : isNext ? 'Next &rarr;' : link.label
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
