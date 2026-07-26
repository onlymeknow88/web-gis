import { Bell, ChevronDown, LogOut, Menu, User, LayoutDashboard } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

import Dropdown from '@/Components/Dropdown';
import React from 'react';

export default function MapHeader({ user, isSidebarOpen, setIsSidebarOpen }) {
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <header className="flex justify-between items-center px-5 w-full h-16 fixed top-0 z-40 bg-white border-b border-outline-variant shrink-0">
            {/* LEFT: burger + brand */}
            <div className="flex items-center gap-3.5">
                {/* Burger — always visible */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Brand: black square + title + subtitle */}
                <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
                            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
                            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
                        </svg>
                    </div>
                    <div>
                        <div className="text-[15px] font-bold text-on-surface leading-tight">WebGIS Portal</div>
                        <div className="text-[11.5px] text-on-surface-variant leading-tight">Sistem Informasi Geografis</div>
                    </div>
                </div>
            </div>

            {/* RIGHT: icon buttons + user chip */}
            <div className="flex items-center gap-1.5">

                {/* Dashboard Button */}
                <Link
                    href={route('dashboard')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary border border-primary hover:bg-primary hover:text-white rounded-md transition-colors mr-1"
                >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dashboard</span>
                </Link>

                {/* User chip */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center gap-2 px-[6px] py-[6px] pr-[10px] rounded-full hover:bg-surface-container transition-colors focus:outline-none ml-1.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c839b] to-[#45464d] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {initials}
                            </div>
                            <span className="text-[13.5px] font-semibold text-on-surface hidden sm:block">{user.name}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden sm:block" />
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content>
                        <Dropdown.Link href={route('profile.edit')}>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-on-surface-variant" />
                                Profile Settings
                            </div>
                        </Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            <div className="flex items-center gap-2 text-destructive-red">
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </div>
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}
