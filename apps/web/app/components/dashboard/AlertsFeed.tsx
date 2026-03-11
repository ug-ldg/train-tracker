'use client';

import { useTrainStore } from '../../stores/trainStore';

export function AlertsFeed() {
  const alerts = useTrainStore((s) => s.alerts);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white tracking-tight">Alertes actives</h2>
      {alerts.length === 0 ? (
        <p className="text-zinc-600 text-xs">Aucune alerte en cours</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert, i) => (
            <div key={i} className="p-3 rounded-xl bg-red-500/5 border border-white/6 border-l-2 border-l-red-500">
              <p className="text-zinc-200 text-xs leading-relaxed">{alert.message}</p>
              <p className="text-zinc-600 text-xs mt-1.5">
                {new Date(alert.triggeredAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
