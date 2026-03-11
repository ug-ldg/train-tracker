'use client';

import { useTrainStore } from '../../stores/trainStore';

export function AlertsFeed() {
  const alerts = useTrainStore((s) => s.alerts);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-white">Alertes actives</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune alerte en cours</p>
      ) : (
        alerts.map((alert, i) => (
          <div key={i} className="bg-red-950 border border-red-800 rounded-lg p-3">
            <p className="text-red-300 text-sm">{alert.message}</p>
            <p className="text-red-500 text-xs mt-1">
              {new Date(alert.triggeredAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}