import React from 'react';
import { AlertTriangle, FileArchive, X } from 'lucide-react';
export default function EditLayerModal({
    isOpen,
    setIsOpen,
    editForm,
    handleEditSubmit
}) {
    if (!isOpen) return null;
    const hasZipFile = !!editForm.data.zip_file;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Edit Layer GIS</h3>
                    <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    {/* Nama Tampilan */}
                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Tampilan</label>
                        <input
                            type="text"
                            value={editForm.data.display_name}
                            onChange={(e) => editForm.setData('display_name', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {editForm.errors.display_name && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{editForm.errors.display_name}</p>}
                    </div>
                    {/* File ZIP Shapefile (Optional Update) */}
                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                            Perbarui File ZIP Shapefile (Opsional)
                        </label>
                        {hasZipFile ? (
                            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-2 text-xs text-primary font-semibold">
                                    <FileArchive className="w-4 h-4 text-primary" />
                                    <span>{editForm.data.zip_file.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editForm.setData('zip_file', null)}
                                    className="p-1 hover:bg-primary/10 rounded text-primary"
                                    title="Hapus File"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <input
                                type="file"
                                accept=".zip"
                                onChange={(e) => editForm.setData('zip_file', e.target.files[0])}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                            />
                        )}
                        <p className="text-[9px] text-on-surface-variant mt-1">
                            Unggah file ZIP baru jika ingin memperbarui/mengganti data spasial layer ini di GeoServer.
                        </p>
                        {editForm.errors.zip_file && (
                            <p className="text-[10px] text-destructive-red mt-1 font-semibold">{editForm.errors.zip_file}</p>
                        )}
                    </div>
                    {/* GeoServer Layer Name (Hidden if ZIP uploaded) */}
                    {hasZipFile ? (
                        <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-800 text-[11px] leading-relaxed flex gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                            <div>
                                <span className="font-bold block mb-0.5">Ganti Shapefile Terdeteksi:</span>
                                Nama layer GeoServer akan diperbarui secara otomatis berdasarkan file ZIP Shapefile baru yang diunggah.
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">GeoServer Layer Name (Workspace:LayerName)</label>
                            <input
                                type="text"
                                value={editForm.data.geoserver_layer}
                                onChange={(e) => editForm.setData('geoserver_layer', e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {editForm.errors.geoserver_layer && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{editForm.errors.geoserver_layer}</p>}
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Urutan Tampil</label>
                            <input
                                type="number"
                                value={editForm.data.display_order}
                                onChange={(e) => editForm.setData('display_order', parseInt(e.target.value) || 0)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {editForm.errors.display_order && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{editForm.errors.display_order}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Warna Polygon</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={editForm.data.color || '#3b82f6'}
                                    onChange={(e) => editForm.setData('color', e.target.value)}
                                    className="w-8 h-8 rounded border border-outline-variant cursor-pointer p-0 bg-transparent shrink-0"
                                />
                                <input
                                    type="text"
                                    value={editForm.data.color || '#3b82f6'}
                                    onChange={(e) => editForm.setData('color', e.target.value)}
                                    placeholder="#3b82f6"
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-2 py-2 text-xs font-mono text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            {editForm.errors.color && (
                                <p className="text-[10px] text-destructive-red mt-1 font-semibold">{editForm.errors.color}</p>
                            )}
                        </div>
                        <div className="h-[38px] flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant hover:bg-surface-container-high transition select-none">
                                <input
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4"
                                />
                                <span className="text-[10px] font-bold text-on-surface leading-none">Aktif</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi Layer</label>
                        <textarea
                            value={editForm.data.description}
                            onChange={(e) => editForm.setData('description', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                        />
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
                            disabled={editForm.processing}
                            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {editForm.processing ? 'Menyimpan...' : 'Perbarui Layer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
