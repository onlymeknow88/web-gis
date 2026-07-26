import React from 'react';
import { Users, Plus } from 'lucide-react';

export default function UsersHeader({ openCreateModal }) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
            <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">User Directory</h1>
                <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    Manage user profiles, authenticate new coordinators, allocate administrative permissions, and track active sessions across the platform.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={openCreateModal}
                    className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md text-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Pengguna
                </button>
            </div>
        </div>
    );
}
