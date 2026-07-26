import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Layers, 
    MapPin, 
    Users, 
    History, 
    SettingsInputComponent, 
    Map, 
    Server,
    Activity
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const navItems = [
        {
            name: 'Dashboard',
            route: 'dashboard',
            icon: LayoutDashboard,
            adminOnly: true
        },
        {
            name: 'Layer Management',
            route: 'admin.layers.index',
            icon: Layers,
            adminOnly: true
        },
        {
            name: 'Marker Management',
            route: 'admin.markers.index',
            icon: MapPin,
            adminOnly: true
        },
        {
            name: 'User Management',
            route: 'admin.users.index',
            icon: Users,
            adminOnly: true
        },
        {
            name: 'GeoServer Config',
            route: 'admin.geoserver.index',
            icon: Server,
            adminOnly: true
        },
        {
            name: 'System Audit Logs',
            route: 'admin.logs.index',
            icon: History,
            adminOnly: true
        }
    ];

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div 
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
                />
            )}

            <aside 
                className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] flex flex-col z-40 bg-surface-container border-r border-outline-variant transition-transform duration-300 md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 bg-surface-container-low p-3 rounded-lg border border-outline-variant/50">
                        <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center border border-outline-variant text-secondary">
                            <Activity className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-on-surface">Site Operations</h2>
                            <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">Main Workspace</p>
                        </div>
                    </div>

                    <Link 
                        href={route('map')}
                        className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary/90 transition-all rounded font-semibold text-xs flex items-center justify-center gap-2 mb-4"
                    >
                        <Map className="w-4 h-4" />
                        Open Interactive Map
                    </Link>
                </div>

                <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.adminOnly && user.role !== 'admin') return null;
                        const isCurrent = route().current(item.route) || 
                            (item.route === 'dashboard' && route().current('dashboard'));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={route(item.route)}
                                className={`flex items-center py-2.5 px-4 font-semibold text-xs rounded transition-all ${
                                    isCurrent
                                        ? 'border-l-4 border-primary bg-surface-container-high text-on-surface'
                                        : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border-l-4 border-transparent'
                                }`}
                            >
                                <Icon className="w-4 h-4 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-2 pb-6 space-y-1 mt-auto">
                    <div className="p-4 mx-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-center">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">System Status</p>
                        <div className="flex items-center justify-center gap-1.5 mt-1 text-success-emerald">
                            <span className="w-1.5 h-1.5 rounded-full bg-success-emerald animate-pulse"></span>
                            <span className="text-[10px] font-mono font-bold">CONNECTED</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
