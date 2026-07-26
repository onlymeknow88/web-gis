import React from 'react';

export default function MapFooter() {
    return (
        <footer
            className="fixed bottom-0 left-0 w-full h-8 flex items-center justify-between px-5 z-50 shrink-0 text-[11.5px]"
            style={{ background: '#0c1220', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#9aa0aa' }}
        >
            <span>© 2026 WebGIS Portal. All rights reserved.</span>
            <span className="hidden sm:flex items-center gap-0">
                Data sumber:&nbsp;
                <a href="#" className="text-[#c8cdd6] hover:text-white transition-colors">GeoServer</a>
                <span className="mx-2 opacity-40">|</span>
                <a href="#" className="text-[#c8cdd6] hover:text-white transition-colors">OpenStreetMap</a>
                <span className="mx-2 opacity-40">|</span>
                <a href="#" className="text-[#c8cdd6] hover:text-white transition-colors">Ina-Geoportal</a>
            </span>
        </footer>
    );
}
