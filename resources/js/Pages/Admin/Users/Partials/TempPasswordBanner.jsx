import React from 'react';
import { Key, Copy } from 'lucide-react';

export default function TempPasswordBanner({ tempPasswordDisplay, setTempPasswordDisplay }) {
    if (!tempPasswordDisplay) return null;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Password berhasil disalin!');
    };

    return (
        <div className="bg-success-emerald/10 border border-success-emerald/20 rounded-xl p-5 shadow-sm space-y-3 relative animate-in fade-in slide-in-from-top-4 duration-200">
            <button 
                onClick={() => setTempPasswordDisplay(null)}
                className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface text-lg font-bold"
            >
                &times;
            </button>
            <h4 className="font-bold text-success-emerald text-sm flex items-center gap-1.5">
                <Key className="w-4 h-4" />
                Password Sementara Berhasil Dibuat
            </h4>
            <p className="text-xs text-on-surface-variant">
                Password sementara untuk <strong>{tempPasswordDisplay.user_name}</strong> telah diperbarui. Silakan salin password di bawah dan berikan kepada pengguna:
            </p>
            <div className="flex items-center gap-2 max-w-xs">
                <code className="bg-surface-container-low border border-outline-variant font-mono text-sm px-3 py-1.5 rounded-lg flex-1 text-on-surface font-bold block select-all">
                    {tempPasswordDisplay.temp_password}
                </code>
                <button
                    onClick={() => copyToClipboard(tempPasswordDisplay.temp_password)}
                    className="p-2 bg-success-emerald hover:bg-success-emerald/90 text-on-primary rounded-lg transition-all"
                    title="Salin Password"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
