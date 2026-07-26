import React from 'react';
import { Server } from 'lucide-react';

export default function DashboardSystemInfo({ systemInfo }) {
    if (!systemInfo) return null;

    const rows = [
        { label: 'Versi Aplikasi', value: systemInfo.app_version },
    ];

    const usedGb = systemInfo.storage_used_gb ?? 0;
    const totalGb = systemInfo.storage_total_gb ?? 10;
    const driveLetter = systemInfo.drive_letter ?? '';
    const fillPct = totalGb > 0 ? Math.min((usedGb / totalGb) * 100, 100) : 0;

    return (
        <div className="bg-white border border-outline-variant rounded-sm overflow-hidden">
            {/* Panel head */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-outline-variant">
                <Server className="w-4 h-4 text-on-surface-variant" />
                <span className="text-[15px] font-bold text-on-surface">Informasi Sistem</span>
            </div>

            {/* Rows */}
            <div className="px-5 pt-1 pb-4">
                {rows.map(({ label, value }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between py-3 border-b border-surface-container text-[13.5px] last:border-0"
                    >
                        <span className="text-on-surface-variant">{label}</span>
                        <span className="font-mono font-semibold text-on-surface text-[13px]">{value}</span>
                    </div>
                ))}

                {/* Storage row */}
                <div className="flex flex-col gap-2.5 py-3.5">
                    <div className="flex items-center justify-between text-[13.5px]">
                        <span className="text-on-surface-variant">
                            Penyimpanan {driveLetter && `(Drive ${driveLetter})`}
                        </span>
                        <span className="font-mono font-semibold text-on-surface text-[13px]">
                            {usedGb} GB / {totalGb} GB ({fillPct.toFixed(1)}%)
                        </span>
                    </div>
                    {/* Full-width Progress Bar */}
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${fillPct}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
