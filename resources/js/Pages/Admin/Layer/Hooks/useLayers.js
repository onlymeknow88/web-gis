import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
export default function useLayers({ filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [isGenerating, setIsGenerating] = useState(null);
    const [limit, setLimit] = useState(filters.limit || '10');
    // Unified Inertia form for creation (supporting both WMS and Zip Shapefile)
    const createForm = useForm({
        display_name: '',
        zip_file: null,
        geoserver_layer: '',
        description: '',
        color: '#3b82f6',
        display_order: 0,
        is_active: true,
    });
    // Inertia form for editing
    const editForm = useForm({
        _method: 'PUT',
        display_name: '',
        zip_file: null,
        geoserver_layer: '',
        description: '',
        color: '#3b82f6',
        display_order: 0,
        is_active: true,
    });
    // Inertia form for layer-specific user access
    const accessForm = useForm({
        user_ids: [],
    });
    // Search and filter triggers
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.layers.index'), { search, status, limit }, { preserveState: true });
    };
    const handleStatusFilterChange = (newStatus) => {
        setStatus(newStatus);
        router.get(route('admin.layers.index'), { search, status: newStatus, limit }, { preserveState: true });
    };
    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        router.get(route('admin.layers.index'), { search, status, limit: newLimit }, { preserveState: true });
    };
    // Open add modal (resets the form)
    const openAddModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsAddModalOpen(true);
    };
    // Submit layer creation (dynamic action depending on zip_file existence)
    const handleCreateSubmit = (e) => {
        if (e) e.preventDefault();

        if (createForm.data.zip_file) {
            createForm.post(route('admin.layers.upload-shp'), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    createForm.reset();
                },
            });
        } else {
            createForm.post(route('admin.layers.store'), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    createForm.reset();
                },
            });
        }
    };
    // Open edit modal
    const openEditModal = (layer) => {
        setSelectedLayer(layer);
        editForm.setData({
            _method: 'PUT',
            display_name: layer.display_name,
            zip_file: null,
            geoserver_layer: layer.geoserver_layer,
            description: layer.description || '',
            color: layer.color || '#3b82f6',
            display_order: layer.display_order,
            is_active: layer.is_active,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };
    // Submit layer updates
    const handleEditSubmit = (e) => {
        if (e) e.preventDefault();
        editForm.post(route('admin.layers.update', selectedLayer.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
        });
    };
    // Open access modal
    const openAccessModal = (layer) => {
        setSelectedLayer(layer);
        accessForm.setData({
            user_ids: layer.permitted_users ? layer.permitted_users.map(u => u.id) : [],
        });
        accessForm.clearErrors();
        setIsAccessModalOpen(true);
    };
    // Submit user access changes
    const handleAccessSubmit = (e) => {
        if (e) e.preventDefault();
        accessForm.transform((data) => ({
            ...data,
            _method: 'PUT'
        }));
        accessForm.post(route('admin.layers.update-access', selectedLayer.id), {
            onSuccess: () => {
                setIsAccessModalOpen(false);
                accessForm.reset();
            },
            onError: (errors) => {
                if (errors.error) alert(errors.error);
            }
        });
    };
    // Delete action
    const handleDelete = (layer) => {
        if (confirm(`Apakah Anda yakin ingin menghapus layer "${layer.display_name}"?`)) {
            router.post(route('admin.layers.destroy', layer.id), {
                _method: 'DELETE',
                onError: (errors) => {
                    alert(errors.error || 'Gagal menghapus layer.');
                }
            });
        }
    };
    // Inline status toggle
    const handleToggleStatus = (layer) => {
        router.post(route('admin.layers.toggle', layer.id), {
            _method: 'PATCH'
        });
    };
    // Automatically generate center marker
    const handleGenerateMarker = (layer) => {
        setIsGenerating(layer.id);
        router.post(route('admin.layers.generate-marker', layer.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setIsGenerating(null);
            }
        });
    };
    return {
        search,
        setSearch,
        status,
        setStatus,
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
    };
}
