import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import useUsers from './Hooks/useUsers';
import UsersHeader from './Partials/UsersHeader';
import TempPasswordBanner from './Partials/TempPasswordBanner';
import UsersFilters from './Partials/UsersFilters';
import UsersTable from './Partials/UsersTable';
import CreateUserModal from './Partials/CreateUserModal';
import EditUserModal from './Partials/EditUserModal';
import UserAccessModal from './Partials/UserAccessModal';

export default function UsersIndex({ users, filters, layers }) {
    const { flash } = usePage().props;

    const {
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
    } = useUsers({ filters });

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna" />

            <div className="space-y-6">
                {/* View Header */}
                <UsersHeader openCreateModal={openCreateModal} />

                {/* Temporary Password Success Display Banner */}
                <TempPasswordBanner 
                    tempPasswordDisplay={tempPasswordDisplay} 
                    setTempPasswordDisplay={setTempPasswordDisplay} 
                />

                {/* Error Alerts */}
                {flash?.error && (
                    <div className="p-4 bg-rose-50 border border-destructive-red/20 rounded-xl text-destructive-red text-xs font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        {flash.error}
                    </div>
                )}

                {/* Filters bar */}
                <UsersFilters
                    search={search}
                    setSearch={setSearch}
                    role={role}
                    handleRoleFilterChange={handleRoleFilterChange}
                    status={status}
                    handleStatusFilterChange={handleStatusFilterChange}
                    handleSearchSubmit={handleSearchSubmit}
                />

                {/* Users Table */}
                <UsersTable
                    users={users}
                    currentUserId={currentUserId}
                    handleResetPassword={handleResetPassword}
                    openEditModal={openEditModal}
                    openAccessModal={openAccessModal}
                    handleDelete={handleDelete}
                    search={search}
                    role={role}
                    status={status}
                    limit={limit}
                    handleLimitChange={handleLimitChange}
                />
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                setIsOpen={setIsCreateModalOpen}
                createForm={createForm}
                handleCreateSubmit={handleCreateSubmit}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={isEditModalOpen}
                setIsOpen={setIsEditModalOpen}
                editForm={editForm}
                handleEditSubmit={handleEditSubmit}
                selectedUser={selectedUser}
                currentUserId={currentUserId}
            />

            {/* User Layer Access Modal */}
            <UserAccessModal
                isOpen={isAccessModalOpen}
                setIsOpen={setIsAccessModalOpen}
                accessForm={accessForm}
                handleAccessSubmit={handleAccessSubmit}
                selectedUser={selectedUser}
                layers={layers}
            />
        </AuthenticatedLayout>
    );
}

