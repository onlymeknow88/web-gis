import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function useMarkers(filters) {
    const [search, setSearch] = useState(filters.search || '');
    const [layerId, setLayerId] = useState(filters.layer_id || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const [limit, setLimit] = useState(filters.limit || '10');

    // Form hooks
    const createForm = useForm({
        name: '',
        longitude: '',
        latitude: '',
        description: '',
        icon: 'standard',
        layer_id: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        longitude: '',
        latitude: '',
        description: '',
        icon: 'standard',
        layer_id: '',
        is_active: true,
    });

    const importForm = useForm({
        file: null,
        layer_id: '',
    });

    // Search and filter submissions
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.markers.index'), { search, layer_id: layerId, limit }, { preserveState: true });
    };

    const handleLayerFilterChange = (newLayerId) => {
        setLayerId(newLayerId);
        router.get(route('admin.markers.index'), { search, layer_id: newLayerId, limit }, { preserveState: true });
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        router.get(route('admin.markers.index'), { search, layer_id: layerId, limit: newLimit }, { preserveState: true });
    };

    const handleResetFilters = () => {
        setSearch('');
        setLayerId('');
        router.get(route('admin.markers.index'), { search: '', layer_id: '', limit: '10' }, { preserveState: true });
    };

    // Open/Close Create Modal
    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateModalOpen(true);
    };

    // Open/Close Edit Modal
    const openEditModal = (marker) => {
        setSelectedMarker(marker);
        editForm.setData({
            name: marker.name,
            longitude: parseFloat(marker.longitude),
            latitude: parseFloat(marker.latitude),
            description: marker.description || '',
            icon: marker.icon || 'standard',
            layer_id: marker.layer_id || '',
            is_active: marker.is_active,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    // Submit layer creation
    const handleCreateSubmit = (e) => {
        if (e) e.preventDefault();
        createForm.post(route('admin.markers.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        if (e) e.preventDefault();
        editForm.transform((data) => ({
            ...data,
            _method: 'PUT'
        }));
        editForm.post(route('admin.markers.update', selectedMarker.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };

    const handleDelete = (marker) => {
        if (confirm(`Apakah Anda yakin ingin menghapus marker "${marker.name}"?`)) {
            router.post(route('admin.markers.destroy', marker.id), {
                _method: 'DELETE'
            });
        }
    };

    const handleImportSubmit = (e) => {
        if (e) e.preventDefault();
        importForm.post(route('admin.markers.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                importForm.reset();
            },
        });
    };

    return {
        search,
        setSearch,
        layerId,
        setLayerId,
        limit,
        handleLimitChange,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isImportModalOpen,
        setIsImportModalOpen,
        selectedMarker,
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
        handleImportSubmit,
    };
}
