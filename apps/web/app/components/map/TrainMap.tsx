'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useTrainStore } from '../../stores/trainStore';
import 'leaflet/dist/leaflet.css';

const LEVEL_COLORS = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
};

function delayColor(seconds: number): string {
    if (seconds < 300) return '#facc15';  // < 5 min : jaune
    if (seconds < 900) return '#f97316';  // < 15 min : orange
    return '#ef4444';                      // ≥ 15 min : rouge
}

export function TrainMap() {
    const stressScores = useTrainStore((s) => s.stressScores);
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

            {/* Cercles de stress par ligne (temps réel uniquement) */}
            {mode === 'realtime' && stressScores
                .filter((s) => s.avgLat !== 0 && s.avgLon !== 0)
                .map((s) => (
                    <CircleMarker
                        key={s.lineId}
                        center={[s.avgLat, s.avgLon]}
                        radius={8 + s.score * 12}
                        pathOptions={{
                            color: LEVEL_COLORS[s.level],
                            fillColor: LEVEL_COLORS[s.level],
                            fillOpacity: 0.2,
                            weight: 2,
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{s.lineName}</strong><br />
                                Retard moyen : {Math.round(s.avgDelaySeconds / 60)} min<br />
                                Score : {Math.round(s.score * 100)}%
                            </div>
                        </Popup>
                    </CircleMarker>
                ))
            }

            {/* Points individuels par train en retard */}
            {displayedTrains
                .filter((t) => t.lat !== 0 && t.lon !== 0)
                .map((t, i) => (
                    <CircleMarker
                        key={`${t.trainId}-${i}`}
                        center={[t.lat, t.lon]}
                        radius={5}
                        pathOptions={{
                            color: delayColor(t.delaySeconds),
                            fillColor: delayColor(t.delaySeconds),
                            fillOpacity: 0.9,
                            weight: 1,
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong>{t.lineName}</strong><br />
                                Gare : {t.nextStopName}<br />
                                Retard : +{Math.round(t.delaySeconds / 60)} min
                            </div>
                        </Popup>
                    </CircleMarker>
                ))
            }
        </MapContainer>
    );
}