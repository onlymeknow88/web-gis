import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ConnectionTestHUD({ testResult }) {
    if (!testResult) return null;

    const isSuccess = testResult.success;

    return (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${
            isSuccess
                ? 'bg-success-emerald/10 border-success-emerald/20 text-success-emerald'
                : 'bg-rose-50 border-destructive-red/20 text-destructive-red'
        }`}>
            {isSuccess ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-success-emerald mt-0.5 shrink-0" />
            ) : (
                <AlertTriangle className="w-4.5 h-4.5 text-destructive-red mt-0.5 shrink-0" />
            )}
            <div>
                <span className="font-bold block mb-0.5">{isSuccess ? 'Koneksi Sukses!' : 'Koneksi Gagal'}</span>
                <span className="leading-relaxed font-normal">{testResult.message}</span>
            </div>
        </div>
    );
}
