import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LayerAccessModal({ isOpen, setIsOpen, accessForm, handleAccessSubmit, selectedLayer, users = [] }) {
    if (!isOpen) return null;

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const userIds = accessForm.data.user_ids || [];

    const handleCheckboxChange = (userId, checked) => {
        if (checked) {
            accessForm.setData('user_ids', [...userIds, userId]);
        } else {
            accessForm.setData('user_ids', userIds.filter(id => id !== userId));
        }
    };

    const selectAll = () => {
        // Select all users that are currently matching the search filter
        const filteredIds = filteredUsers.map(u => u.id);
        const newUserIds = Array.from(new Set([...userIds, ...filteredIds]));
        accessForm.setData('user_ids', newUserIds);
    };

    const deselectAll = () => {
        // Deselect all users that are currently matching the search filter
        const filteredIds = filteredUsers.map(u => u.id);
        const newUserIds = userIds.filter(id => !filteredIds.includes(id));
        accessForm.setData('user_ids', newUserIds);
    };

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

    // Adjust page if page is out of bounds
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages]);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Akses Pengguna Layer
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                
                <div className="px-6 pt-4 pb-2">
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-3">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Layer GIS</span>
                        <span className="text-xs font-bold text-on-surface block leading-tight">{selectedLayer?.display_name}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono mt-0.5 block">{selectedLayer?.geoserver_layer}</span>
                    </div>
                </div>

                <form onSubmit={handleAccessSubmit} className="p-6 pt-2 space-y-4">
                    
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Pilih Pengguna yang Diberi Akses ({userIds.length} terpilih)
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="text-[9px] font-bold text-primary hover:underline"
                            >
                                Pilih Semua
                            </button>
                            <span className="text-outline-variant text-[9px] font-bold">|</span>
                            <button
                                type="button"
                                onClick={deselectAll}
                                className="text-[9px] font-bold text-destructive-red hover:underline"
                            >
                                Hapus Semua
                            </button>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama pengguna / email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40"
                        />
                        <Search className="w-3.5 h-3.5 text-on-surface-variant/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* User List Container */}
                    <div className="border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant bg-surface-container-lowest min-h-[120px]">
                        {paginatedUsers.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-variant italic text-xs">
                                {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Tidak ada pengguna biasa yang aktif.'}
                            </div>
                        ) : (
                            paginatedUsers.map((user) => {
                                const isChecked = userIds.includes(user.id);
                                return (
                                    <label
                                        key={user.id}
                                        className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-surface-container-low transition select-none ${
                                            isChecked ? 'bg-primary/5' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                                            className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4 mt-0.5 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-on-surface leading-tight truncate">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] text-on-surface-variant font-mono mt-0.5 truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant text-[11px]">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className="px-2.5 py-1 bg-white border border-outline-variant rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-on-surface-variant transition flex items-center gap-1 shadow-sm"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Prev
                            </button>
                            <span className="font-bold text-on-surface-variant">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className="px-2.5 py-1 bg-white border border-outline-variant rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-on-surface-variant transition flex items-center gap-1 shadow-sm"
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    
                    {accessForm.errors.user_ids && (
                        <p className="text-[10px] text-destructive-red font-semibold">{accessForm.errors.user_ids}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={accessForm.processing}
                            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {accessForm.processing ? 'Menyimpan...' : 'Simpan Hak Akses'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
