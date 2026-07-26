import React from 'react';
import { Check } from 'lucide-react';

export default function LayersStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Storage Utilization</span>
                <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-black text-on-surface">12.4 GB</span>
                    <span className="text-success-emerald text-[11px] font-mono pb-1 font-semibold">▲ 4% month</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Server Latency</span>
                <div className="flex items-end gap-2 mt-1">
                    <span className="text-2xl font-black text-on-surface">84 ms</span>
                    <span className="text-success-emerald text-[11px] font-mono pb-1 font-semibold">STABLE</span>
                </div>
                <div className="flex gap-1.5 mt-2 h-10 items-end justify-between px-1">
                    <div className="h-[60%] w-2.5 bg-success-emerald/30 rounded-t-sm animate-pulse"></div>
                    <div className="h-[40%] w-2.5 bg-success-emerald/30 rounded-t-sm"></div>
                    <div className="h-[80%] w-2.5 bg-success-emerald/30 rounded-t-sm"></div>
                    <div className="h-[95%] w-2.5 bg-success-emerald rounded-t-sm"></div>
                    <div className="h-[60%] w-2.5 bg-success-emerald/30 rounded-t-sm"></div>
                    <div className="h-[75%] w-2.5 bg-success-emerald/30 rounded-t-sm"></div>
                    <div className="h-[50%] w-2.5 bg-success-emerald/30 rounded-t-sm"></div>
                    <div className="h-[90%] w-2.5 bg-success-emerald/40 rounded-t-sm"></div>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 shadow-sm">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">API Endpoint Status</span>
                <div className="flex items-center gap-3 mt-3">
                    <div className="p-2 bg-primary-fixed rounded-full">
                        <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-on-surface">WMS / WFS Services</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">v2.4.1 (Stable Release)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
