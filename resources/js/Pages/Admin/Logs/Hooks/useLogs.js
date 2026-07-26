import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function useLogs(filters) {
    const [search, setSearch] = useState(filters.search || '');
    const [module, setModule] = useState(filters.module || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedLog, setSelectedLog] = useState(null);

    // Apply filters
    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.logs.index'), {
            search,
            module,
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true });
    };

    // Reset filters
    const handleResetFilters = () => {
        setSearch('');
        setModule('');
        setUserId('');
        setStartDate('');
        setEndDate('');
        router.get(route('admin.logs.index'), {});
    };

    // Dynamic CSV export link builder
    const getExportLink = () => {
        const params = new URLSearchParams({
            search,
            module,
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
        });
        return `${route('admin.logs.export')}?${params.toString()}`;
    };

    return {
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
    };
}
