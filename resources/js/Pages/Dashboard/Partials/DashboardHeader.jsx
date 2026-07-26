import { Calendar } from 'lucide-react';
import React from 'react';

export default function DashboardHeader({ user }) {
    const now = new Date();
    const dateLabel = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
    });

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">
                    Selamat datang, {user?.name ?? 'Admin'}!
                </h1>
                <p className="text-sm text-on-surface-variant">
                    Kelola data spasial dan pantau sistem WebGIS Anda.
                </p>
            </div>

            {/* Date pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-outline-variant rounded-full text-sm font-medium text-on-surface whitespace-nowrap self-start sm:self-auto">
                <Calendar className="w-4 h-4 text-on-surface-variant shrink-0" />
                {dateLabel}
            </div>
        </div>
    );
}
