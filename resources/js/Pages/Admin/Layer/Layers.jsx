import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { ShieldAlert, Check } from 'lucide-react';
import useLayers from './Hooks/useLayers';
import LayersHeader from './Partials/LayersHeader';
import LayersFilters from './Partials/LayersFilters';
import LayersTable from './Partials/LayersTable';
import LayersStats from './Partials/LayersStats';
import AddLayerModal from './Partials/AddLayerModal';
import EditLayerModal from './Partials/EditLayerModal';
import LayerAccessModal from './Partials/LayerAccessModal';

export default function LayersIndex({ layers, filters, users }) {
    const { flash, errors } = usePage().props;

    const {
        search,
        setSearch,
        status,
        limit,
        handleLimitChange,
        isAddModalOpen,
        setIsAddModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isAccessModalOpen,
        setIsAccessModalOpen,
        selectedLayer,
        setSelectedLayer,
        isGenerating,
        createForm,
        editForm,
        accessForm,
        handleSearchSubmit,
        handleStatusFilterChange,
        openAddModal,
        handleCreateSubmit,
        openEditModal,
        handleEditSubmit,
        openAccessModal,
        handleAccessSubmit,
        handleDelete,
        handleToggleStatus,
        handleGenerateMarker,
    } = useLayers({ filters });


    return (
        <AuthenticatedLayout>
            <Head title="Layer Management" />

            <div className="space-y-6">
                {/* View Header */}
                <LayersHeader
                    layers={layers}
                    status={status}
                    handleStatusFilterChange={handleStatusFilterChange}
                    openAddModal={openAddModal}
                />

                {/* Flash Notifications */}
                {flash?.message && (
                    <div className="p-4 bg-success-emerald/10 border border-success-emerald/20 rounded-xl text-success-emerald text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-success-emerald shrink-0" />
                        <span>{flash.message}</span>
                    </div>
                )}
                {(flash?.error || errors?.error) && (
                    <div className="p-4 bg-rose-50 border border-destructive-red/20 rounded-xl text-destructive-red text-xs font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-destructive-red" />
                        <span>{flash?.error || errors?.error}</span>
                    </div>
                )}

                {/* Filter Bar */}
                <LayersFilters
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    handleStatusFilterChange={handleStatusFilterChange}
                    handleSearchSubmit={handleSearchSubmit}
                />

                {/* Data Table */}
                <LayersTable
                    layers={layers}
                    search={search}
                    status={status}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                    isGenerating={isGenerating}
                    handleToggleStatus={handleToggleStatus}
                    handleGenerateMarker={handleGenerateMarker}
                    openEditModal={openEditModal}
                    openAccessModal={openAccessModal}
                    handleDelete={handleDelete}
                />

            </div>

            {/* Add Layer Modal (WMS & Shapefile combined) */}
            <AddLayerModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                createForm={createForm}
                handleCreateSubmit={handleCreateSubmit}
            />

            {/* Edit Layer Modal */}
            <EditLayerModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                editForm={editForm}
                handleEditSubmit={handleEditSubmit}
            />

            {/* Layer User Access Modal */}
            <LayerAccessModal
                isOpen={isAccessModalOpen}
                setIsOpen={setIsAccessModalOpen}
                accessForm={accessForm}
                handleAccessSubmit={handleAccessSubmit}
                selectedLayer={selectedLayer}
                users={users}
            />
        </AuthenticatedLayout>

    );
}

