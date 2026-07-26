import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function useGeoConfig({ config }) {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    // Form hook
    const form = useForm({
        id: config.id || '',
        name: config.name || '',
        base_url: config.base_url || '',
        workspace: config.workspace || '',
        username: config.username || '',
        password: config.id ? '' : '', // placeholder if editing
    });

    const handleSave = (e) => {
        e.preventDefault();
        setTestResult(null);
        form.post(route('admin.geoserver.update'), {
            onSuccess: () => {
                form.setData('password', ''); // reset back to placeholder
            }
        });
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const response = await axios.post(route('admin.geoserver.test'), {
                id: form.data.id,
                base_url: form.data.base_url,
                username: form.data.username,
                password: form.data.password,
            });

            setTestResult(response.data);
        } catch (error) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'Gagal menghubungi server backend: ' + error.message,
            });
        } finally {
            setIsTesting(false);
        }
    };

    return {
        form,
        isTesting,
        testResult,
        setTestResult,
        handleSave,
        handleTestConnection,
    };
}
