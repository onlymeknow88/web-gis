import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';

export default function LogsTable({
    logs,
    search,
    userId,
    module,
    startDate,
    endDate,
    setSelectedLog
}) {
    const columns = useMemo(() => [
        {
            accessorKey: 'created_at',
            header: 'Waktu (WIB/Local)',
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <span className="font-mono text-[11px] text-on-surface-variant">
                        {new Date(val).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                    </span>
                );
            }
        },
        {
            accessorKey: 'user',
            header: 'Pengguna',
            cell: ({ getValue }) => {
                const user = getValue();
                return user ? (
                    <div>
                        <span className="font-bold text-on-surface block leading-tight">{user.name}</span>
                        <span className="text-[10px] text-on-surface-variant block font-normal leading-normal">{user.email}</span>
                    </div>
                ) : (
                    <span className="text-on-surface-variant/55 italic">Sistem/Non-user</span>
                );
            }
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ getValue }) => (
                <span className="bg-surface-container-high text-on-surface font-mono px-2 py-0.5 rounded font-bold text-[10px] uppercase border border-outline-variant/30">
                    {getValue()}
                </span>
            )
        },
        {
            accessorKey: 'module',
            header: 'Modul',
            cell: ({ getValue }) => (
                <span className="text-on-surface font-bold text-[11px] uppercase tracking-wider">{getValue()}</span>
            )
        },
        {
            accessorKey: 'description',
            header: 'Deskripsi',
            cell: ({ getValue }) => {
                const desc = getValue();
                return (
                    <span className="text-on-surface-variant max-w-xs truncate block" title={desc}>
                        {desc}
                    </span>
                );
            }
        },
        {
            accessorKey: 'ip_address',
            header: 'IP Address',
            cell: ({ getValue }) => (
                <span className="font-mono text-[11px] text-on-surface-variant">{getValue() || '-'}</span>
            )
        },
        {
            id: 'detail',
            header: () => <div className="text-right">Detail</div>,
            cell: ({ row }) => {
                const log = row.original;
                return (
                    <div className="text-right">
                        <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all inline-flex items-center"
                            title="Lihat Detil"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ], [setSelectedLog]);

    const table = useReactTable({
        data: logs.data,
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
                                    Tidak ada log aktivitas ditemukan.
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
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-t border-outline-variant">
                <span className="text-xs text-on-surface-variant">
                    Showing <span className="text-on-surface font-bold">{(logs.current_page - 1) * logs.per_page + 1} - {Math.min(logs.current_page * logs.per_page, logs.total)}</span> of <span className="text-on-surface font-bold">{logs.total}</span> logs
                </span>
                <div className="flex items-center gap-2">
                    {logs.links.map((link, idx) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');

                        return (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, {
                                    search,
                                    module,
                                    user_id: userId,
                                    start_date: startDate,
                                    end_date: endDate,
                                }, { preserveState: true })}
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
