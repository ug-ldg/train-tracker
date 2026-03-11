'use client';

import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useTrainStore } from '../../stores/trainStore';
import 'leaflet/dist/leaflet.css';

function delayColor(seconds: number): string {
    if (seconds < 300) return '#facc15';
    if (seconds < 900) return '#f97316';
    return '#ef4444';
}

function createTrainIcon(color: string) {
    return L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,0.4);box-shadow:0 0 4px ${color}66"></div>`,
        className: '',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -6],
    });
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

            {/* Points individuels — temps réel avec clustering */}
            {mode === 'realtime' && (
                <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                    {trains
                        .filter((t) => t.lat !== 0 && t.lon !== 0 && !isNaN(t.lat) && !isNaN(t.lon))
                        .map((t, i) => (
                            <Marker
                                key={`rt-${t.trainId}-${i}`}
                                position={[t.lat, t.lon]}
                                icon={createTrainIcon(delayColor(t.delaySeconds))}
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
            )}

            {/* Points historiques — avec clustering */}
            {mode === 'history' && (
                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={40}
                >
                    {displayedTrains
                        .filter((t) => t.lat !== 0 && t.lon !== 0 && !isNaN(t.lat) && !isNaN(t.lon))
                        .map((t, i) => (
                            <Marker
                                key={`hist-${t.trainId}-${i}`}
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
