import {
    ChevronRight,
    History,
    Layers,
    LayoutDashboard,
    MapPin,
    Settings2,
    Users
} from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ isOpen, onClose }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const navItems = [
        { name: 'Dashboard',        route: 'dashboard',             icon: LayoutDashboard },
        { name: 'Layers',           route: 'admin.layers.index',    icon: Layers },
        { name: 'Markers',          route: 'admin.markers.index',   icon: MapPin },
        { name: 'Users',            route: 'admin.users.index',     icon: Users },
        { name: 'Config',           route: 'admin.geoserver.index', icon: Settings2 },
        { name: 'Logs',             route: 'admin.logs.index',      icon: History },
    ];

    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col justify-between z-40 bg-white border-r border-outline-variant transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-outline-variant">
                        {/* Black square brand mark */}
                        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
                                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
                                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
                            </svg>
                        </div>
                        <div>
                            <div className="text-[15px] font-bold text-on-surface leading-tight">WebGIS</div>
                            <div className="text-[12px] text-on-surface-variant leading-tight">Admin Panel</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="px-4 py-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant px-3 pb-2.5">
                            Menu Utama
                        </div>

                        {navItems.map((item) => {
                            let isActive = false;
                            try { isActive = route().current(item.route); } catch (_) {}
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.route}
                                    href={route(item.route)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150 ${
                                        isActive
                                            ? 'bg-primary text-on-primary'
                                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                    }`}
                                >
                                    <Icon className="w-[18px] h-[18px] shrink-0" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

            </aside>
        </>
    );
}
