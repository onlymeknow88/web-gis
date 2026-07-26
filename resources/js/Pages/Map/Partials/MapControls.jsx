import React from 'react';
import { Plus, Minus, Maximize2, Navigation } from 'lucide-react';

export default function MapControls({ handleZoomIn, handleZoomOut, handleFullScreen, handleResetView }) {
    const btnClass = "w-10 h-10 bg-white rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors";

    return (
        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
            {/* Zoom group */}
            <div className="flex flex-col rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                <button
                    onClick={handleZoomIn}
                    className={`${btnClass} rounded-none border-b border-outline-variant`}
                    title="Zoom In"
                    aria-label="Zoom in"
                >
                    <Plus className="w-[18px] h-[18px]" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className={`${btnClass} rounded-none`}
                    title="Zoom Out"
                    aria-label="Zoom out"
                >
                    <Minus className="w-[18px] h-[18px]" />
                </button>
            </div>

            {/* Fullscreen */}
            <button
                onClick={handleFullScreen}
                className={`${btnClass} shadow-[0_2px_8px_rgba(0,0,0,0.18)]`}
                title="Fullscreen"
                aria-label="Toggle fullscreen"
            >
                <Maximize2 className="w-[18px] h-[18px]" />
            </button>

            {/* Reset view */}
            <button
                onClick={handleResetView}
                className={`${btnClass} shadow-[0_2px_8px_rgba(0,0,0,0.18)]`}
                title="Reset view"
                aria-label="Reset map view"
            >
                <Navigation className="w-[18px] h-[18px] rotate-45 text-secondary" />
            </button>
        </div>
    );
}
