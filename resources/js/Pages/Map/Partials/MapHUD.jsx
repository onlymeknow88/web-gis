import React from 'react';

export default function MapHUD({ pointerCoord, zoomLevel, scaleRatio }) {
    return (
        <div className="absolute bottom-12 left-4 z-30 rounded-lg px-4 py-3 font-mono text-xs text-[#e5e7eb] min-w-[160px] select-none"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
        >
            {/* Lat */}
            <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">Lat</span>
                <span className="font-semibold">{pointerCoord.lat.toFixed(6)}°</span>
            </div>
            {/* Lon */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">Lon</span>
                <span className="font-semibold">{pointerCoord.lon.toFixed(6)}°</span>
            </div>

            {/* Separator */}
            <div className="border-t border-white/10 my-2" />

            {/* Zoom */}
            <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">Zoom</span>
                <span className="font-semibold">{Math.round(zoomLevel)}</span>
            </div>
            {/* Scale */}
            <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[#9ca3af] text-[10px] uppercase tracking-wider">Skala</span>
                <span className="font-semibold">{scaleRatio || '1 : 50.000'}</span>
            </div>

            {/* Separator */}
            <div className="border-t border-white/10 my-2" />

            {/* Status */}
            <div className="flex items-center gap-2">
                <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
                    style={{ boxShadow: '0 0 0 3px rgba(52,211,153,0.25)' }}
                />
                <span className="text-[10px] text-[#9ca3af]">
                    Koneksi: <span className="text-emerald-400 font-semibold">Online</span>
                </span>
            </div>
        </div>
    );
}
