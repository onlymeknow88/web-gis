import React from 'react';
import { Server } from 'lucide-react';

export default function GeoserverConfigHeader() {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary-fixed text-primary px-2.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 border border-primary-fixed-dim/30">
                        <Server className="w-3.5 h-3.5" />
                        GEOSERVER CONFIG
                    </span>
                    <span className="text-on-surface-variant text-[10px] font-mono">WORKSPACE: SITE OPS</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">GeoServer Settings</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Configure base endpoints, workspaces, and administrative credentials to enable dynamic Web Map Services (WMS) layers rendering.
                </p>
            </div>
        </div>
    );
}
