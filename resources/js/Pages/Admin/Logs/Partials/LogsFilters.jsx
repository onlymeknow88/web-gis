import React from 'react';
import { Search } from 'lucide-react';

export default function LogsFilters({
    search,
    setSearch,
    userId,
    setUserId,
    module,
    setModule,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    users,
    modules,
    handleFilterSubmit,
    handleResetFilters
}) {
    return (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Pencarian & Filter Logs
            </h3>
            
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                
                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Kata Kunci</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Aksi, modul, IP..."
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/60"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Filter User</label>
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                        <option value="">Semua User</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Filter Modul</label>
                    <select
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    >
                        <option value="">Semua Modul</option>
                        {modules.map((m, idx) => (
                            <option key={idx} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Mulai Tanggal</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1.5">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div className="col-span-1 sm:col-span-2 md:col-span-5 flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface-variant transition-all"
                    >
                        Reset Filters
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                        Terapkan Filter
                    </button>
                </div>

            </form>
        </div>
    );
}
