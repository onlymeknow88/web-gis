import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import useMarkers from './Hooks/useMarkers';
import MarkersHeader from './Partials/MarkersHeader';
import MarkersFilters from './Partials/MarkersFilters';
import MarkersTable from './Partials/MarkersTable';
import CreateMarkerModal from './Partials/CreateMarkerModal';
import EditMarkerModal from './Partials/EditMarkerModal';
import ImportCSVModal from './Partials/ImportCSVModal';

export default function Markers({ markers, layers, filters }) {
    const { flash } = usePage().props;

    const {
        search,
        setSearch,
        layerId,
        limit,
        handleLimitChange,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        createForm,
        editForm,
        importForm,
        handleSearchSubmit,
        handleLayerFilterChange,
        handleResetFilters,
        openCreateModal,
        openEditModal,
        handleCreateSubmit,
        handleEditSubmit,
        handleDelete,
        handleImportSubmit
    } = useMarkers(filters);

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Marker GIS" />

            <div className="space-y-6">
                <MarkersHeader
                    setIsImportModalOpen={setIsImportModalOpen}
                    openCreateModal={openCreateModal}
                />

                {/* Import Warnings display */}
                {flash?.import_warnings && (
                    <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl text-amber-800 text-xs flex gap-2">
                        <Info className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <h4 className="font-bold mb-1">Peringatan saat Import CSV:</h4>
                            <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto font-mono">
                                {flash.import_warnings.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <MarkersFilters
                    search={search}
                    setSearch={setSearch}
                    layerId={layerId}
                    layers={layers}
                    handleSearchSubmit={handleSearchSubmit}
                    handleLayerFilterChange={handleLayerFilterChange}
                    handleResetFilters={handleResetFilters}
                />

                <MarkersTable
                    markers={markers}
                    search={search}
                    layerId={layerId}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                    openEditModal={openEditModal}
                    handleDelete={handleDelete}
                />
            </div>

            <CreateMarkerModal
                isOpen={isCreateModalOpen}
                setIsOpen={setIsCreateModalOpen}
                createForm={createForm}
                handleCreateSubmit={handleCreateSubmit}
                layers={layers}
            />

            <EditMarkerModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                editForm={editForm}
                handleEditSubmit={handleEditSubmit}
                layers={layers}
            />

            <ImportCSVModal
                isOpen={isImportModalOpen}
                setIsOpen={setIsImportModalOpen}
                importForm={importForm}
                handleImportSubmit={handleImportSubmit}
                layers={layers}
            />
        </AuthenticatedLayout>
    );
}
