import React from 'react';

export default function CreateUserModal({ isOpen, setIsOpen, createForm, handleCreateSubmit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Tambah Pengguna Baru</h3>
                    <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Contoh: Budi Santoso"
                        />
                        {createForm.errors.name && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Alamat Email</label>
                        <input
                            type="email"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Contoh: email@alamtri.com"
                        />
                        {createForm.errors.email && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Password Awal</label>
                        <input
                            type="password"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Min 8 karakter, huruf & angka"
                        />
                        {createForm.errors.password && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.password}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Role</label>
                            <select
                                value={createForm.data.role}
                                onChange={(e) => createForm.setData('role', e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                            >
                                <option value="user">User Biasa</option>
                                <option value="admin">Administrator</option>
                            </select>
                            {createForm.errors.role && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.role}</p>}
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-surface-container-low border border-outline-variant hover:bg-surface-container-high transition select-none h-9">
                                <input
                                    type="checkbox"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4"
                                />
                                <span className="text-[11px] font-bold text-on-surface">Aktifkan Akun</span>
                            </label>
                        </div>
                    </div>

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
                            disabled={createForm.processing}
                            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
