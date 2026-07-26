import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from '@tanstack/react-table';
import { router } from '@inertiajs/react';
import { Key, Edit2, Trash2, Layers } from 'lucide-react';

export default function UsersTable({
    users,
    currentUserId,
    handleResetPassword,
    openEditModal,
    openAccessModal,
    handleDelete,
    search,
    role,
    status,
    limit,
    handleLimitChange
}) {
    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-on-surface block leading-tight">
                            {user.name}
                        </span>
                        {user.id === currentUserId && (
                            <span className="text-[9px] bg-primary-fixed text-primary px-1.5 py-0.5 rounded font-bold border border-primary-fixed-dim/30 font-mono">
                                YOU
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ getValue }) => (
                <span className="text-on-surface-variant font-mono">{getValue()}</span>
            )
        },
        {
            accessorKey: 'role',
            header: () => <div className="text-center">Role</div>,
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <div className="text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            val === 'admin'
                                ? 'bg-primary-container text-white border-outline-variant/30'
                                : 'bg-surface-container-high text-on-surface-variant border-outline-variant'
                        }`}>
                            {val === 'admin' ? 'ADMIN' : 'USER'}
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'layer_access',
            header: () => <div className="text-center">Akses Layer</div>,
            cell: ({ row }) => {
                const user = row.original;
                if (user.role === 'admin') {
                    return (
                        <div className="text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-success-emerald/10 text-success-emerald border border-success-emerald/20">
                                AKSES PENUH
                            </span>
                        </div>
                    );
                }
                const count = user.accessible_layers ? user.accessible_layers.length : 0;
                return (
                    <div className="text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            count > 0 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-surface-container-high text-on-surface-variant border-outline-variant'
                        }`}>
                            {count} Layer
                        </span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'is_active',
            header: () => <div className="text-center">Status</div>,
            cell: ({ getValue }) => {
                const isActive = getValue();
                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isActive
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
            accessorKey: 'last_login_at',
            header: 'Login Terakhir',
            cell: ({ getValue }) => {
                const val = getValue();
                return (
                    <span className="font-mono text-[11px] text-on-surface-variant">
                        {val ? (
                            new Date(val).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        ) : (
                            <span className="italic text-on-surface-variant/40">Belum pernah login</span>
                        )}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center justify-end gap-1.5 opacity-65 group-hover:opacity-100 transition-opacity">
                        {user.role === 'user' ? (
                            <button
                                onClick={() => openAccessModal(user)}
                                className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                                title="Atur Akses Layer"
                            >
                                <Layers className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                disabled
                                className="p-1.5 rounded-lg text-on-surface-variant/20 cursor-not-allowed"
                                title="Admin memiliki akses penuh ke semua layer secara default"
                            >
                                <Layers className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Reset Password"
                        >
                            <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all"
                            title="Edit"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete(user)}
                            disabled={user.id === currentUserId}
                            className={`p-1.5 rounded-lg transition-all ${
                                user.id === currentUserId
                                    ? 'text-on-surface-variant/20 cursor-not-allowed'
                                    : 'text-on-surface-variant hover:text-destructive-red hover:bg-rose-50'
                            }`}
                            title="Hapus"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            }
        }
    ], [currentUserId, handleResetPassword, openEditModal, openAccessModal, handleDelete]);


    const table = useReactTable({
        data: users.data,
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
                                    Tidak ada data pengguna ditemukan.
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
                        Showing <span className="text-on-surface font-bold">{(users.current_page - 1) * users.per_page + 1} - {Math.min(users.current_page * users.per_page, users.total)}</span> of <span className="text-on-surface font-bold">{users.total}</span> users
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
                    {users.links.map((link, idx) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');

                        return (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => router.get(link.url, { search, role, status, limit }, { preserveState: true })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    link.active
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
