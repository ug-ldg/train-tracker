'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useTrainStore } from '../../stores/trainStore';
import 'leaflet/dist/leaflet.css';

const LEVEL_COLORS = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
};

export function TrainMap() {
    const stressScores = useTrainStore((s) => s.stressScores);

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
            {stressScores
                .filter((s) => s.avgLat !== 0 && s.avgLon !== 0)
                .map((s) => (
                    <CircleMarker
                        key={s.lineId}
                        center={[s.avgLat, s.avgLon]}
                        radius={8 + s.score * 12}
                        pathOptions={{
                            color: LEVEL_COLORS[s.level],
                            fillColor: LEVEL_COLORS[s.level],
                            fillOpacity: 0.7,
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
        </MapContainer>
    );
}