import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Copy, ExternalLink } from 'lucide-react';

export default function MapPopup({ popupElement, popupInfo, closePopup, copyToClipboard }) {
    if (!popupInfo || !popupElement.current) {
        return null;
    }

    return createPortal(
        <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.28)] border border-outline-variant w-[230px]">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#d5e3fd] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#1d4ed8]" />
                    </div>
                    <h4 className="text-[13px] font-bold text-on-surface leading-tight truncate">
                        {popupInfo.name || 'Informasi Lokasi'}
                    </h4>
                </div>
                <button
                    onClick={closePopup}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
                    aria-label="Tutup popup"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2">
                {/* Description */}
                {popupInfo.description && (
                    <p className="text-[12px] text-on-surface-variant leading-snug">
                        {popupInfo.description}
                    </p>
                )}

                {/* Coordinates block */}
                {(popupInfo.hdms || popupInfo.decimal) && (
                    <div className="bg-surface-container rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                                Koordinat
                            </span>
                            <button
                                onClick={() => copyToClipboard(`${popupInfo.hdms} | ${popupInfo.decimal}`)}
                                className="text-primary hover:opacity-75 transition-opacity"
                                title="Salin koordinat tampilan"
                                aria-label="Salin koordinat"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="font-mono text-[11px] text-on-surface leading-snug">
                            {popupInfo.hdms && <div>{popupInfo.hdms}</div>}
                            {popupInfo.decimal && (
                                <div className="text-on-surface-variant">{popupInfo.decimal}</div>
                            )}
                        </div>
                        {popupInfo.googleMapsCoords && (
                            <div className="pt-1.5 mt-1 border-t border-outline-variant/30 flex items-center justify-between gap-1 text-[10.5px]">
                                <span className="text-on-surface-variant">Google Maps:</span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => copyToClipboard(popupInfo.googleMapsCoords)}
                                        className="text-primary font-bold hover:underline"
                                        title="Salin format Lat, Lon"
                                    >
                                        Salin Lat,Lon
                                    </button>
                                    <span className="text-outline-variant">|</span>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${popupInfo.googleMapsCoords}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary font-bold hover:underline flex items-center gap-0.5"
                                    >
                                        Buka
                                        <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* WMS feature properties */}
                {popupInfo.wmsInfo && popupInfo.wmsInfo.length > 0 && (
                    <div className="space-y-1.5">
                        {popupInfo.wmsInfo.map((info, i) => (
                            <div key={i} className="flex items-start justify-between gap-2 text-[12.5px]">
                                <span className="text-on-surface-variant shrink-0">{info.key}</span>
                                <span className="font-semibold text-on-surface text-right truncate">{info.val}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Layer tag */}
                {popupInfo.layerName && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#004c69] uppercase tracking-wider">
                        <MapPin className="w-3 h-3" />
                        {popupInfo.layerName}
                    </div>
                )}
            </div>

            {/* Footer / Detail Action (Dikomentari/dinonaktifkan sementara dari tampilan) */}
            {/* 
            <div className="px-4 pb-4">
                <button
                    onClick={closePopup}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-surface-container hover:bg-surface-variant rounded-lg text-[12px] font-semibold text-on-surface transition-colors"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Detail Lokasi
                </button>
            </div>
            */}
        </div>,
        popupElement.current
    );
}
