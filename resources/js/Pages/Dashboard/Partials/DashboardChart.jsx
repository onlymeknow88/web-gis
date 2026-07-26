import React from 'react';
import { Activity, Calendar } from 'lucide-react';

export default function DashboardChart({ chartData, maxCount }) {
    return (
        <div className="bg-white border border-outline-variant rounded-sm overflow-hidden">
            {/* Panel head */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-[15px] font-bold text-on-surface">Aktivitas Sistem</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-[13px] font-medium text-on-surface">
                    <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                    7 Hari Terakhir
                </div>
            </div>

            {/* Bar chart */}
            <div className="px-5 pb-5 pt-4">
                <div className="flex items-end justify-between h-56 gap-1">
                    {chartData.map((day, idx) => {
                        const percent = (day.count / maxCount) * 100;
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-1.5 py-0.5 rounded mb-1.5 transition-opacity pointer-events-none shadow-md whitespace-nowrap">
                                    {day.count} aksi
                                </div>
                                {/* Bar */}
                                <div
                                    style={{ height: `${Math.max(percent, 3)}%` }}
                                    className="w-full bg-primary hover:bg-primary/75 rounded-t transition-all duration-300"
                                />
                                {/* X label */}
                                <span className="text-[10px] text-on-surface-variant font-medium mt-2 uppercase tracking-tight">
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
