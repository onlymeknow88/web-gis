import React from 'react';
import { History, Download } from 'lucide-react';

export default function LogsHeader({ getExportLink }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-fixed text-primary px-2.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 border border-primary-fixed-dim/30">
                        <History className="w-3.5 h-3.5" />
                        SECURITY & AUDITS
                    </span>
                    <span className="text-on-surface-variant text-[10px] font-mono">ENFORCEMENT: COMPLIANCE</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Activity Logs</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Audit trail of database operations, config alterations, system events, and administrative activities inside the WebGIS ecosystem.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <a
                    href={getExportLink()}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md text-xs"
                >
                    <Download className="w-3.5 h-3.5" />
                    Ekspor CSV
                </a>
            </div>
        </div>
    );
}
