import React from 'react';
import { Settings, RefreshCw, Save } from 'lucide-react';

export default function GeoserverConfigForm({
    form,
    config,
    isTesting,
    handleSave,
    handleTestConnection
}) {
    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Connection Credentials</span>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
                
                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Konfigurasi</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: GeoServer Production"
                    />
                    {form.errors.name && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{form.errors.name}</p>}
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Base URL WMS GeoServer</label>
                    <input
                        type="url"
                        value={form.data.base_url}
                        onChange={(e) => form.setData('base_url', e.target.value)}
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: http://10.102.128.21:8080/geoserver"
                    />
                    {form.errors.base_url && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{form.errors.base_url}</p>}
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Workspace Default</label>
                    <input
                        type="text"
                        value={form.data.workspace}
                        onChange={(e) => form.setData('workspace', e.target.value)}
                        required
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Contoh: Indonesia"
                    />
                    {form.errors.workspace && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{form.errors.workspace}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Username GeoServer (Opsional)</label>
                        <input
                            type="text"
                            value={form.data.username}
                            onChange={(e) => form.setData('username', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="admin"
                        />
                        {form.errors.username && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{form.errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Password GeoServer (Opsional)</label>
                        <input
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={config.id ? 'Kosongkan jika tidak ingin diubah' : 'geoserver'}
                        />
                        {form.errors.password && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{form.errors.password}</p>}
                    </div>
                </div>

                {/* Actions block */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-outline-variant">
                    <button
                        type="button"
                        disabled={isTesting}
                        onClick={handleTestConnection}
                        className="w-full sm:w-auto px-4 py-2 border border-outline-variant hover:bg-surface-container-low bg-surface-container-lowest text-on-surface rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-primary' : ''}`} />
                        {isTesting ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="w-full sm:w-auto px-6 py-2 bg-primary hover:opacity-90 text-on-primary rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {form.processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>

            </form>
        </div>
    );
}
