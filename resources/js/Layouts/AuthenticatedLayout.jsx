import Navbar from '@/Components/Dashboard/Navbar';
import Sidebar from '@/Components/Dashboard/Sidebar';
import Footer from '@/Components/Dashboard/Footer';
import { useState } from 'react';

export default function AuthenticatedLayout({ children }) {
    // Open by default on desktop, can be toggled
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-surface text-on-surface font-sans antialiased">
            {/* Fixed Navbar */}
            <Navbar 
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
                isSidebarOpen={isSidebarOpen}
            />

            {/* Body: sidebar + main, starts below navbar */}
            <div className="flex pt-16 min-h-screen">
                {/* Sidebar — sticky so it stays full height as page scrolls */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main
                    className={`flex-1 pb-12 transition-all duration-300 ${
                        isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-0'
                    }`}
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(118, 119, 125, 0.05) 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                    }}
                >
                    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
