import { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';

export default function useUsers({ filters }) {
    const currentUserId = usePage().props.auth.user.id;

    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [limit, setLimit] = useState(filters.limit || '10');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [tempPasswordDisplay, setTempPasswordDisplay] = useState(null);

    // Form hooks
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        email: '',
        role: 'user',
        is_active: true,
    });

    const accessForm = useForm({
        layer_ids: [],
    });

    // Search and filter triggers
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.users.index'), { search, role, status, limit }, { preserveState: true });
    };

    const handleRoleFilterChange = (newRole) => {
        setRole(newRole);
        router.get(route('admin.users.index'), { search, role: newRole, status, limit }, { preserveState: true });
    };

    const handleStatusFilterChange = (newStatus) => {
        setStatus(newStatus);
        router.get(route('admin.users.index'), { search, role, status: newStatus, limit }, { preserveState: true });
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        router.get(route('admin.users.index'), { search, role, status, limit: newLimit }, { preserveState: true });
    };

    // Open/Close modals
    const openCreateModal = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const openAccessModal = (user) => {
        setSelectedUser(user);
        accessForm.setData({
            layer_ids: user.accessible_layers ? user.accessible_layers.map(l => l.id) : [],
        });
        accessForm.clearErrors();
        setIsAccessModalOpen(true);
    };

    // Submit actions
    const handleCreateSubmit = (e) => {
        if (e) e.preventDefault();
        createForm.post(route('admin.users.store'), {
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
        editForm.post(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                editForm.reset();
            },
            onError: (errors) => {
                if (errors.error) alert(errors.error);
            }
        });
    };

    const handleAccessSubmit = (e) => {
        if (e) e.preventDefault();
        accessForm.transform((data) => ({
            ...data,
            _method: 'PUT'
        }));
        accessForm.post(route('admin.users.update-access', selectedUser.id), {
            onSuccess: () => {
                setIsAccessModalOpen(false);
                accessForm.reset();
            },
            onError: (errors) => {
                if (errors.error) alert(errors.error);
            }
        });
    };

    const handleDelete = (user) => {
        if (user.id === currentUserId) {
            alert('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.name}"?`)) {
            router.post(route('admin.users.destroy', user.id), {
                _method: 'DELETE',
                onError: (errors) => {
                    alert(errors.error || 'Gagal menghapus pengguna.');
                }
            });
        }
    };

    const handleResetPassword = (user) => {
        if (confirm(`Apakah Anda yakin ingin mereset password pengguna "${user.name}" ke password sementara?`)) {
            router.post(route('admin.users.reset-password', user.id), {}, {
                onSuccess: (page) => {
                    const passwordInfo = page.props.flash?.temp_password_info;
                    if (passwordInfo) {
                        setTempPasswordDisplay(passwordInfo);
                    }
                }
            });
        }
    };

    return {
        currentUserId,
        search,
        setSearch,
        role,
        status,
        limit,
        handleLimitChange,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isAccessModalOpen,
        setIsAccessModalOpen,
        selectedUser,
        tempPasswordDisplay,
        setTempPasswordDisplay,
        createForm,
        editForm,
        accessForm,
        handleSearchSubmit,
        handleRoleFilterChange,
        handleStatusFilterChange,
        openCreateModal,
        openEditModal,
        openAccessModal,
        handleCreateSubmit,
        handleEditSubmit,
        handleAccessSubmit,
        handleDelete,
        handleResetPassword,
    };
}
