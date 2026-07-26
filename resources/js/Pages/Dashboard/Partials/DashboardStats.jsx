import { Activity, Layers, MapPin, TrendingUp, Users } from 'lucide-react';
import React from 'react';

const CARDS = [
    {
        key: 'layers',
        label: 'Total Layers',
        icon: Layers,
        iconBg: '#d5e3fd',
        iconColor: '#1d4ed8',
        getValue: (stats) => stats.layers.total,
        getSub: (stats) => (
            <>
                <span className="bg-[#d7f0dc] text-[#1b6c31] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#1b6c31]/20">
                    {stats.layers.active} Aktif
                </span>
                <span className="text-on-surface-variant">·</span>
                <span>{stats.layers.inactive} Nonaktif</span>
            </>
        ),
    },
    {
        key: 'markers',
        label: 'Total Markers',
        icon: MapPin,
        iconBg: '#d7f0dc',
        iconColor: '#1b6c31',
        getValue: (stats) => stats.markers.total,
        getSub: (stats) => (
            <>
                <span className="bg-[#d7f0dc] text-[#1b6c31] px-2 py-0.5 rounded-full text-[10px] font-semibold border border-[#1b6c31]/20">
                    {stats.markers.active} Aktif
                </span>
                <span className="text-on-surface-variant">·</span>
                <span>{stats.markers.inactive} Nonaktif</span>
            </>
        ),
    },
    {
        key: 'users',
        label: 'Total Users',
        icon: Users,
        iconBg: '#ecdefc',
        iconColor: '#7c3aed',
        getValue: (stats) => stats.users.total,
        getSub: (stats) => (
            <>
                <span className="bg-[#131b2e] text-white px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {stats.users.admins} Admin
                </span>
                <span className="text-on-surface-variant">·</span>
                <span>{stats.users.regular} Regular</span>
            </>
        ),
    },
    {
        key: 'activity_today',
        label: 'Aktivitas Hari Ini',
        icon: Activity,
        iconBg: '#fdead2',
        iconColor: '#a13f00',
        getValue: (stats) => stats.activity_today ?? 0,
        getSub: () => (
            <span className="flex items-center gap-1 text-[#1b6c31]">
                <TrendingUp className="w-3 h-3" />
                Log operasional
            </span>
        ),
    },
];

export default function DashboardStats({ stats }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map(({ key, label, icon: Icon, iconBg, iconColor, getValue, getSub }) => (
                <div
                    key={key}
                    className="bg-white border border-outline-variant rounded-sm p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow"
                >
                    {/* Icon circle */}
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: iconBg, color: iconColor }}
                    >
                        <Icon className="w-[22px] h-[22px]" />
                    </div>

                    <div className="min-w-0">
                        <div className="text-[13px] text-on-surface-variant mb-1">{label}</div>
                        <div className="text-[26px] font-extrabold text-on-surface leading-none mb-1.5">
                            {getValue(stats).toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface-variant flex-wrap">
                            {getSub(stats)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
