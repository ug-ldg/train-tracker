'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useTrainStore, TrainPosition } from '../../stores/trainStore';
import 'leaflet/dist/leaflet.css';

function delayColor(seconds: number): string {
    if (seconds < 300) return '#facc15';
    if (seconds < 900) return '#f97316';
    return '#ef4444';
}

function createTrainIcon(color: string, highlighted = false) {
    const size = highlighted ? 18 : 10;
    const anchor = highlighted ? 9 : 5;
    return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${highlighted ? '2px solid white' : '1px solid rgba(255,255,255,0.4)'};box-shadow:0 0 ${highlighted ? '10px' : '4px'} ${color}"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [anchor, anchor],
        popupAnchor: [0, -(anchor + 2)],
    });
}

function createClusterIcon(count: number, highlighted: boolean) {
    const size = highlighted ? 36 : 30;
    const anchor = size / 2;
    const html = highlighted
        ? `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(250,204,21,0.15);border:2px solid #facc15;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:600;box-shadow:0 0 12px #facc1588">${count}</div>`
        : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:rgba(20,20,40,0.85);border:1px solid rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;color:#d4d4d8;font-size:11px;font-weight:500">${count}</div>`;
    return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [anchor, anchor] });
}

function RealtimeMarkers({ trains }: { trains: TrainPosition[] }) {
    const hoveredTrainId = useTrainStore((s) => s.hoveredTrainId);
    const selectedTrainId = useTrainStore((s) => s.selectedTrainId);
    const setSelectedTrainId = useTrainStore((s) => s.setSelectedTrainId);
    const hoveredIdRef = useRef<string | null>(null);
    const clusterRef = useRef<any>(null);
    const markerRefs = useRef<Map<string, any>>(new Map());

    // Hover: mise à jour directe des icônes de cluster visibles
    useEffect(() => {
        hoveredIdRef.current = hoveredTrainId;
        clusterRef.current?._featureGroup?.eachLayer?.((layer: any) => {
            if (typeof layer.getChildCount === 'function') {
                const hasHovered = layer.getAllChildMarkers().some(
                    (m: any) => m.options.title === hoveredIdRef.current,
                );
                layer.setIcon(createClusterIcon(layer.getChildCount(), hasHovered));
            }
        });
    }, [hoveredTrainId]);

    // Click: zoom via zoomToShowLayer qui traverse la hiérarchie de clusters
    useEffect(() => {
        if (!selectedTrainId || !clusterRef.current) return;
        const marker = markerRefs.current.get(selectedTrainId);
        if (!marker) return;
        clusterRef.current.zoomToShowLayer(marker, () => {
            marker.openPopup();
        });
        // Reset immédiat pour permettre de recliquer la même card
        setSelectedTrainId(null);
    }, [selectedTrainId]);

    return (
        <MarkerClusterGroup
            ref={clusterRef}
            chunkedLoading
            maxClusterRadius={40}
            iconCreateFunction={(cluster: any) => {
                const hasHovered = cluster.getAllChildMarkers().some(
                    (m: any) => m.options.title === hoveredIdRef.current,
                );
                return createClusterIcon(cluster.getChildCount(), hasHovered);
            }}
        >
            {trains
                .filter((t) => t.lat !== 0 && t.lon !== 0 && !isNaN(t.lat) && !isNaN(t.lon))
                .map((t) => (
                    <Marker
                        key={t.trainId}
                        position={[t.lat, t.lon]}
                        title={t.trainId}
                        icon={createTrainIcon(delayColor(t.delaySeconds), t.trainId === hoveredTrainId)}
                        zIndexOffset={t.trainId === hoveredTrainId ? 1000 : 0}
                        ref={(m) => {
                            if (m) markerRefs.current.set(t.trainId, m);
                            else markerRefs.current.delete(t.trainId);
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{t.lineName}</strong><br />
                                {t.nextStopName && <>Gare : {t.nextStopName}<br /></>}
                                Retard : +{Math.round(t.delaySeconds / 60)} min
                            </div>
                        </Popup>
                    </Marker>
                ))
            }
        </MarkerClusterGroup>
    );
}

export function TrainMap() {
    const trains = useTrainStore((s) => s.trains);
    const mode = useTrainStore((s) => s.mode);
    const historyTrains = useTrainStore((s) => s.historyTrains);

    const displayedTrains = mode === 'history' ? historyTrains : trains;

    return (
        <MapContainer
            center={[46.8, 2.3]}
            zoom={6}
            className="w-full h-full"
            style={{ background: '#1a1a2e' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {mode === 'realtime' && <RealtimeMarkers trains={trains} />}

            {/* Points historiques — avec clustering */}
            {mode === 'history' && (
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={40}
                    iconCreateFunction={(cluster: any) => createClusterIcon(cluster.getChildCount(), false)}
                >
                    {displayedTrains
                        .filter((t) => t.lat !== 0 && t.lon !== 0 && !isNaN(t.lat) && !isNaN(t.lon))
                        .map((t, i) => (
                            <Marker
                                key={`${t.trainId}-${i}`}
                                position={[t.lat, t.lon]}
                                icon={createTrainIcon(delayColor(t.delaySeconds))}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <strong>{t.lineName}</strong><br />
                                        {t.nextStopName && <>Gare : {t.nextStopName}<br /></>}
                                        Retard moyen : +{Math.round(t.delaySeconds / 60)} min
                                        {t.firstSeen && t.lastSeen && (
                                            <>
                                                <br />
                                                Du {new Date(t.firstSeen).toLocaleDateString('fr-FR')} à {new Date(t.firstSeen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                <br />
                                                au {new Date(t.lastSeen).toLocaleDateString('fr-FR')} à {new Date(t.lastSeen).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    }
                </MarkerClusterGroup>
            )}
        </MapContainer>
    );
}
