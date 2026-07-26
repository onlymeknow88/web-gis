import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DashboardChart from './Partials/DashboardChart';
import DashboardHeader from './Partials/DashboardHeader';
import DashboardRecentLogs from './Partials/DashboardRecentLogs';
import DashboardStats from './Partials/DashboardStats';
import DashboardMapPreview from './Partials/DashboardMapPreview';
import DashboardSystemInfo from './Partials/DashboardSystemInfo';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

export default function Dashboard({ stats, latestLogs, chartData, systemInfo }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const maxCount = Math.max(...chartData.map(d => d.count), 5);

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-4">
                {/* Page header — greeting + date */}
                <DashboardHeader user={user} />

                {/* 1. Stat cards — 4 columns */}
                <DashboardStats stats={stats} />

                {/* 2. Chart + Recent Logs (Admin Only) */}
                {user.role === 'admin' && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                        <DashboardChart chartData={chartData} maxCount={maxCount} />
                        <DashboardRecentLogs latestLogs={latestLogs} />
                    </div>
                )}

                {/* 3. Map Preview + System Info (System Info is Admin Only) */}
                {user.role === 'admin' ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                        <DashboardMapPreview />
                        <DashboardSystemInfo systemInfo={systemInfo} />
                    </div>
                ) : (
                    <div className="w-full">
                        <DashboardMapPreview />
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
