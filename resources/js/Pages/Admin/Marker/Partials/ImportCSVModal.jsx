import React from 'react';

export default function ImportCSVModal({
    isOpen,
    setIsOpen,
    importForm,
    handleImportSubmit,
    layers
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Import Marker Massal</h3>
                    <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">File CSV</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => importForm.setData('file', e.target.files[0])}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary-fixed file:text-primary hover:file:opacity-90"
                        />
                        {importForm.errors.file && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{importForm.errors.file}</p>}
                        <span className="text-[10px] text-on-surface-variant/70 mt-1.5 block leading-normal">
                            * CSV harus memiliki header: <code className="bg-surface-container-low px-1 py-0.5 rounded font-mono font-bold text-on-surface-variant">nama_lokasi, longitude, latitude, deskripsi</code>.
                        </span>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Hubungkan ke Layer (Opsional)</label>
                        <select
                            value={importForm.data.layer_id}
                            onChange={(e) => importForm.setData('layer_id', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                        >
                            <option value="">Tidak ada layer (Umum)</option>
                            {layers.map((l) => (
                                <option key={l.id} value={l.id}>{l.display_name}</option>
                            ))}
                        </select>
                        {importForm.errors.layer_id && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{importForm.errors.layer_id}</p>}
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
                            disabled={importForm.processing}
                            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {importForm.processing ? 'Mengimpor...' : 'Import Data'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
