import { Bell, ChevronDown, ChevronRight, LogOut, Menu, User } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';

// Route name → breadcrumb labels
const BREADCRUMBS = {
    'dashboard':             { parent: 'Admin',   current: 'Dashboard',      sub: 'Overview' },
    'admin.layers.index':    { parent: 'Admin',   current: 'Layers',         sub: 'Manajemen' },
    'admin.markers.index':   { parent: 'Admin',   current: 'Markers',        sub: 'Manajemen' },
    'admin.users.index':     { parent: 'Admin',   current: 'Users',          sub: 'Manajemen' },
    'admin.geoserver.index': { parent: 'Admin',   current: 'GeoServer Config', sub: 'Pengaturan' },
    'admin.logs.index':      { parent: 'Admin',   current: 'Audit Logs',     sub: 'Sistem' },
    'map':                   { parent: 'Portal',  current: 'Live Map',       sub: 'Peta' },
    'profile.edit':          { parent: 'Account', current: 'Profile',        sub: 'Pengaturan' },
};

function getBreadcrumb() {
    for (const [routeName, labels] of Object.entries(BREADCRUMBS)) {
        try {
            if (route().current(routeName)) return labels;
        } catch (_) { /* ignore */ }
    }
    return null;
}

export default function Navbar({ onMenuToggle, isSidebarOpen }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const breadcrumb = getBreadcrumb();
    const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <header className={`bg-white border-b border-outline-variant flex justify-between items-center px-8 h-16 fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            isSidebarOpen ? 'md:left-[280px]' : 'md:left-0'
        }`}>
            {/* LEFT: burger + breadcrumb */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="w-9 h-9 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-[18px] h-[18px]" />
                </button>

                {breadcrumb && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-on-surface">{breadcrumb.current}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-outline" />
                        <span className="text-on-surface-variant">{breadcrumb.sub}</span>
                    </div>
                )}
            </div>

            {/* RIGHT: bell + user chip */}
            <div className="flex items-center gap-2">
                {/* Bell with badge */}
                <div className="relative">
                    <button
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                        aria-label="Notifications"
                    >
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                        </svg>
                    </button>
                </div>

                {/* User chip */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="flex items-center gap-2 px-[6px] py-[6px] pr-[10px] rounded-full hover:bg-surface-container transition-colors focus:outline-none">
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
