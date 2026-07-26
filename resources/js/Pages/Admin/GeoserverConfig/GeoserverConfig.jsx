import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import useGeoConfig from './Hooks/useGeoConfig';
import GeoserverConfigHeader from './Partials/GeoserverConfigHeader';
import ConnectionTestHUD from './Partials/ConnectionTestHUD';
import GeoserverConfigForm from './Partials/GeoserverConfigForm';

export default function GeoserverConfig({ config }) {
    const { flash } = usePage().props;
    const {
        form,
        isTesting,
        testResult,
        handleSave,
        handleTestConnection,
    } = useGeoConfig({ config });

    return (
        <AuthenticatedLayout>
            <Head title="Konfigurasi GeoServer" />

            <div className="space-y-6 max-w-3xl">
                {/* View Header */}
                <GeoserverConfigHeader />

                {/* Flash Success Notification */}
                {flash?.message && (
                    <div className="p-4 bg-success-emerald/10 border border-success-emerald/20 rounded-xl text-success-emerald text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-emerald" />
                        {flash.message}
                    </div>
                )}

                {/* Test Connection Results HUD */}
                <ConnectionTestHUD testResult={testResult} />

                {/* Main Form container */}
                <GeoserverConfigForm
                    form={form}
                    config={config}
                    isTesting={isTesting}
                    handleSave={handleSave}
                    handleTestConnection={handleTestConnection}
                />
            </div>
        </AuthenticatedLayout>
    );
}
