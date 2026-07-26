import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { MapPin, Edit2, Trash2 } from 'lucide-react';

export default function MarkersTable({
    markers,
    search,
    layerId,
    limit,
    handleLimitChange,
    openEditModal,
    handleDelete
}) {
    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama Lokasi',
            cell: ({ row }) => {
                const marker = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-on-surface block leading-tight">{marker.name}</span>
                            <span className="text-[11px] text-on-surface-variant font-normal leading-normal">{marker.description || 'Tidak ada deskripsi'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            id: 'coordinates',
            header: 'Koordinat',
            cell: ({ row }) => {
                const marker = row.original;
                return (
                    <div className="font-mono text-[11px] text-on-surface-variant leading-relaxed">
                        <div>Lon: {marker.longitude}</div>
                        <div>Lat: {marker.latitude}</div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'layer',
            header: 'Layer Terkait',
            cell: ({ getValue }) => {
                const layer = getValue();
                return layer ? (
                    <span className="inline-block px-2 py-0.5 bg-primary-container text-white rounded text-[10px] font-bold border border-outline-variant/30">
                        {layer.display_name}
                    </span>
                ) : (
                    <span className="text-on-surface-variant/50 italic text-[11px]">Umum (Tanpa Layer)</span>
                );
            }
        },
        {
            accessorKey: 'icon',
            header: () => <div className="text-center">Icon</div>,
            cell: ({ getValue }) => (
                <div className="text-center font-mono font-bold uppercase tracking-wider text-[10px] text-on-surface-variant">
                    {getValue() || 'standard'}
                </div>
            )
        },
        {
            accessorKey: 'is_active',
            header: () => <div className="text-center">Status</div>,
            cell: ({ getValue }) => {
                const isActive = getValue();
                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isActive
                            ? 'bg-success-emerald/10 text-success-emerald border-success-emerald/20'
                            : 'bg-surface-variant text-on-surface-variant border-outline-variant'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-emerald animate-pulse' : 'bg-outline'}`}></span>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const marker = row.original;
                return (
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => openEditModal(marker)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Edit"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete(marker)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-on-surface-variant hover:text-destructive-red transition-all"
                            title="Hapus"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            }
        }
    ], [openEditModal, handleDelete]);

    const table = useReactTable({
        data: markers.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-surface-container-high text-on-surface-variant border-b border-outline-variant text-[11px] font-bold tracking-wider uppercase text-left">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="py-4 px-6 select-none font-bold">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-xs">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-10 px-6 text-center text-on-surface-variant italic">
                                    Tidak ada data marker ditemukan.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="py-4 px-6 text-on-surface align-middle">
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

            {/* Pagination */}
            <div className="bg-surface-container-low px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs text-on-surface-variant">
                        Showing <span className="text-on-surface font-bold">{(markers.current_page - 1) * markers.per_page + 1} - {Math.min(markers.current_page * markers.per_page, markers.total)}</span> of <span className="text-on-surface font-bold">{markers.total}</span> markers
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
                    {markers.links.map((link, idx) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');

                        return (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, { search, layer_id: layerId, limit }, { preserveState: true })}
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
