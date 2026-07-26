import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/Components/ui/input';

export default function MapSearch({ searchQuery, setSearchQuery }) {
    return (
        <div className="absolute left-1/2 -translate-x-1/2 top-4 z-30 w-full max-w-[480px] px-4">
            <div
                className="flex items-center gap-2.5 border border-outline-variant rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.12)] px-[18px] py-1"
                style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
            >
                <Search className="w-[17px] h-[17px] text-on-surface-variant shrink-0" />
                <Input
                    type="text"
                    placeholder="Cari marker, lokasi, atau koordinat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none rounded-none shadow-none bg-transparent text-[14px] text-on-surface placeholder:text-on-surface-variant h-10 px-0 focus-visible:ring-0 focus-visible:border-0"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                        aria-label="Hapus pencarian"
                    >
                        <X className="w-[17px] h-[17px]" />
                    </button>
                )}
            </div>
        </div>
    );
}
