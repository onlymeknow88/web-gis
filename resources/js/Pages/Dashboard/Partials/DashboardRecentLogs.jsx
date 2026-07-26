import React from 'react';
import { Link } from '@inertiajs/react';
import { History, ArrowRight } from 'lucide-react';

export default function DashboardRecentLogs({ latestLogs }) {
    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                    <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        Log Terbaru
                    </h4>
                    <Link 
                        href={route('admin.logs.index')}
                        className="text-xs text-primary hover:opacity-80 font-bold flex items-center gap-0.5"
                    >
                        Semua
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="mt-4 space-y-4">
                    {latestLogs.length === 0 ? (
                        <p className="text-xs text-on-surface-variant italic text-center py-8">Belum ada aktivitas tercatat.</p>
                    ) : (
                        latestLogs.map((log) => (
                            <div key={log.id} className="text-xs border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start gap-2">
                                    <span className="font-bold text-on-surface truncate">{log.user ? log.user.name : 'Sistem'}</span>
                                    <span className="text-[9px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-outline-variant/30">
                                        {log.action}
                                    </span>
                                </div>
                                <p className="text-on-surface-variant mt-1 line-clamp-1">{log.description}</p>
                                <span className="text-[9px] font-mono text-on-surface-variant/70 mt-1 block">
                                    {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
