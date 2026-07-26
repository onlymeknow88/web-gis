import React from 'react';
import { Search } from 'lucide-react';

export default function UsersFilters({
    search,
    setSearch,
    role,
    handleRoleFilterChange,
    status,
    handleStatusFilterChange,
    handleSearchSubmit
}) {
    return (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/60"
                />
            </form>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant">Role:</span>
                    <select
                        value={role}
                        onChange={(e) => handleRoleFilterChange(e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px] font-semibold"
                    >
                        <option value="">Semua Role</option>
                        <option value="admin">Administrator</option>
                        <option value="user">User Biasa</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-variant">Status:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg py-2 px-4 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px] font-semibold"
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-aktif</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
