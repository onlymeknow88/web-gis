import React from 'react';
import { Info } from 'lucide-react';

export default function LogDetailModal({ log, setSelectedLog }) {
    if (!log) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-primary" />
                        Detail Log Aktivitas #{log.id}
                    </h3>
                    <button onClick={() => setSelectedLog(null)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Waktu Kejadian</span>
                            <span className="font-mono text-on-surface font-semibold">
                                {new Date(log.created_at).toLocaleString('id-ID', {
                                    day: '2-digit', month: 'long', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">IP Address</span>
                            <span className="font-mono text-on-surface font-semibold">{log.ip_address || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Pengguna</span>
                            <span className="text-on-surface font-bold">{log.user ? log.user.name : 'Sistem'}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Modul</span>
                            <span className="text-on-surface font-bold uppercase tracking-wider">{log.module}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Aksi & Deskripsi</span>
                        <span className="bg-surface-container-high text-on-surface font-mono px-2 py-0.5 rounded font-bold mr-2 text-[9px] uppercase border border-outline-variant/30">
                            {log.action}
                        </span>
                        <p className="text-on-surface-variant mt-2 leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant">{log.description}</p>
                    </div>

                    {/* Old State Display */}
                    {log.old_value && Object.keys(log.old_value).length > 0 && (
                        <div>
                            <span className="block text-[10px] font-bold text-destructive-red uppercase tracking-wider mb-1">Old State (Nilai Sebelum Perubahan)</span>
                            <pre className="bg-surface-container-low p-3 rounded-lg text-[10px] font-mono max-h-40 overflow-y-auto border border-outline-variant text-on-surface-variant">
                                {JSON.stringify(log.old_value, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* New State Display */}
                    {log.new_value && Object.keys(log.new_value).length > 0 && (
                        <div>
                            <span className="block text-[10px] font-bold text-success-emerald uppercase tracking-wider mb-1">New State (Nilai Sesudah Perubahan)</span>
                            <pre className="bg-surface-container-low p-3 rounded-lg text-[10px] font-mono max-h-40 overflow-y-auto border border-outline-variant text-on-surface-variant">
                                {JSON.stringify(log.new_value, null, 2)}
                            </pre>
                        </div>
                    )}

                </div>
                <div className="px-6 py-3 border-t border-outline-variant bg-surface-container-low flex justify-end">
                    <button
                        onClick={() => setSelectedLog(null)}
                        className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-bold transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
