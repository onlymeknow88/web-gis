import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import useLogs from './Hooks/useLogs';
import LogsHeader from './Partials/LogsHeader';
import LogsFilters from './Partials/LogsFilters';
import LogsTable from './Partials/LogsTable';
import LogDetailModal from './Partials/LogDetailModal';

export default function Logs({ logs, users, modules, filters }) {
    const {
        search,
        setSearch,
        module,
        setModule,
        userId,
        setUserId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        selectedLog,
        setSelectedLog,
        handleFilterSubmit,
        handleResetFilters,
        getExportLink,
    } = useLogs(filters);

    return (
        <AuthenticatedLayout>
            <Head title="Audit Trail Logs" />

            <div className="space-y-6">
                <LogsHeader getExportLink={getExportLink} />

                <LogsFilters
                    search={search}
                    setSearch={setSearch}
                    userId={userId}
                    setUserId={setUserId}
                    module={module}
                    setModule={setModule}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    users={users}
                    modules={modules}
                    handleFilterSubmit={handleFilterSubmit}
                    handleResetFilters={handleResetFilters}
                />

                <LogsTable
                    logs={logs}
                    search={search}
                    userId={userId}
                    module={module}
                    startDate={startDate}
                    endDate={endDate}
                    setSelectedLog={setSelectedLog}
                />
            </div>

            <LogDetailModal log={selectedLog} setSelectedLog={setSelectedLog} />
        </AuthenticatedLayout>
    );
}
