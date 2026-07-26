import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default function CreateMarkerModal({
    isOpen,
    setIsOpen,
    createForm,
    handleCreateSubmit,
    layers
}) {
    if (!isOpen) return null;

    const miniMapElement = useRef(null);
    const miniMapRef = useRef(null);
    const pickerSourceRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !miniMapElement.current) return;

        const timer = setTimeout(() => {
            const source = new VectorSource();
            pickerSourceRef.current = source;

            const vectorLayer = new VectorLayer({
                source: source,
                zIndex: 10,
            });

            const initialLong = parseFloat(createForm.data.longitude) || 120.9213;
            const initialLat = parseFloat(createForm.data.latitude) || -3.7893;
            const zoom = createForm.data.longitude ? 10 : 4;

            if (createForm.data.longitude && createForm.data.latitude) {
                const feature = new Feature({
                    geometry: new Point(fromLonLat([initialLong, initialLat])),
                });
                feature.setStyle(
                    new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: `data:image/svg+xml;utf8,${encodeURIComponent(
                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="32" height="42"><path fill="#DC2626" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`
                            )}`,
                            scale: 0.8,
                        }),
                    })
                );
                source.addFeature(feature);
            }

            const map = new OLMap({
                target: miniMapElement.current,
                controls: [],
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    vectorLayer,
                ],
                view: new View({
                    center: fromLonLat([initialLong, initialLat]),
                    zoom: zoom,
                }),
            });
            miniMapRef.current = map;

            map.on('singleclick', (evt) => {
                const coordinate = evt.coordinate;
                const lonLat = toLonLat(coordinate);
                
                createForm.setData((prev) => ({
                    ...prev,
                    longitude: parseFloat(lonLat[0].toFixed(7)),
                    latitude: parseFloat(lonLat[1].toFixed(7)),
                }));

                source.clear();
                const feature = new Feature({
                    geometry: new Point(coordinate),
                });
                feature.setStyle(
                    new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: `data:image/svg+xml;utf8,${encodeURIComponent(
                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="32" height="42"><path fill="#DC2626" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>`
                            )}`,
                            scale: 0.8,
                        }),
                    })
                );
                source.addFeature(feature);
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            if (miniMapRef.current) {
                miniMapRef.current.setTarget(null);
                miniMapRef.current = null;
            }
        };
    }, [isOpen]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl border border-outline-variant shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                    <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Tambah Marker Baru</h3>
                    <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-on-surface font-semibold text-lg">&times;</button>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nama Lokasi</label>
                            <input
                                type="text"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Contoh: Site Pit Barat"
                                required
                            />
                            {createForm.errors.name && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Longitude</label>
                                <input
                                    type="text"
                                    value={createForm.data.longitude}
                                    onChange={(e) => createForm.setData('longitude', e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="120.9213"
                                    required
                                />
                                {createForm.errors.longitude && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.longitude}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Latitude</label>
                                <input
                                    type="text"
                                    value={createForm.data.latitude}
                                    onChange={(e) => createForm.setData('latitude', e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="-3.7893"
                                    required
                                />
                                {createForm.errors.latitude && <p className="text-[10px] text-destructive-red mt-1 font-semibold">{createForm.errors.latitude}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Layer Terkait</label>
                            <select
                                value={createForm.data.layer_id}
                                onChange={(e) => createForm.setData('layer_id', e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                            >
                                <option value="">Umum (Tanpa Layer)</option>
                                {layers.map((l) => (
                                    <option key={l.id} value={l.id}>{l.display_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Icon Marker</label>
                                <select
                                    value={createForm.data.icon}
                                    onChange={(e) => createForm.setData('icon', e.target.value)}
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                                >
                                    <option value="standard">Standard (Pin)</option>
                                    <option value="office">Gedung / Office</option>
                                    <option value="mine">Tambang / Mine</option>
                                </select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-surface-container-low border border-outline-variant hover:bg-surface-container-high transition select-none h-9">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                        className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4"
                                    />
                                    <span className="text-[11px] font-bold text-on-surface">Aktif</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Deskripsi</label>
                            <textarea
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary h-20 resize-none"
                                placeholder="Keterangan singkat..."
                            />
                        </div>
                    </div>

                    {/* Click on Map Picker column */}
                    <div className="flex flex-col">
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                            Pilih Koordinat di Peta
                        </label>
                        <div 
                            ref={miniMapElement} 
                            className="w-full h-full min-h-[220px] rounded-xl border border-outline-variant overflow-hidden bg-surface-container shadow-inner"
                        ></div>
                        <span className="text-[10px] text-on-surface-variant/70 mt-1 block font-bold italic">
                            * Klik pada peta di atas untuk mengisi koordinat secara otomatis.
                        </span>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="px-5 py-2 bg-primary hover:bg-primary/95 text-on-primary rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            {createForm.processing ? 'Menyimpan...' : 'Simpan Marker'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
