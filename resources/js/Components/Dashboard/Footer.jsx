import { useState, useEffect } from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const utcTime = now.toISOString().replace('T', ' ').substring(11, 19);
            setTimeStr(`System Time: ${utcTime} UTC`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 w-full h-8 flex items-center justify-between px-4 z-50 bg-surface-container-lowest border-t border-outline-variant">
            <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] text-success-emerald flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
                    © {currentYear} TerraMine Solutions. Geoserver Status: Connected
                </span>
                <div className="h-3 w-px bg-outline-variant"></div>
                <span className="font-mono text-[11px] text-on-surface-variant">{timeStr}</span>
            </div>
            <div className="flex items-center gap-6">
                <a className="font-mono text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="font-mono text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
                <a className="font-mono text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="#">API Status</a>
            </div>
        </footer>
    );
}
