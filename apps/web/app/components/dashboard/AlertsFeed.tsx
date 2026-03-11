'use client';

import { useTrainStore } from '../../stores/trainStore';

function delayBorderColor(seconds: number): string {
  if (seconds >= 900) return 'border-l-red-500';
  if (seconds >= 300) return 'border-l-orange-400';
  return 'border-l-yellow-400';
}

export function AlertsFeed() {
  const trains = useTrainStore((s) => s.trains);
  const isConnected = useTrainStore((s) => s.isConnected);
  const lastUpdated = useTrainStore((s) => s.lastUpdated);
  const hoveredTrainId = useTrainStore((s) => s.hoveredTrainId);
  const setSelectedTrainId = useTrainStore((s) => s.setSelectedTrainId);
  const setHoveredTrainId = useTrainStore((s) => s.setHoveredTrainId);

  const delayedTrains = trains
    .filter((t) => t.delaySeconds > 0)
    .sort((a, b) => b.delaySeconds - a.delaySeconds);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex items-center justify-between shrink-0">
        {lastUpdated ? (
          <p className="text-zinc-500 text-xs">
            Dernière mise à jour : <span className="font-semibold text-zinc-300">{lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        ) : <span />}
        <span className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-zinc-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          {isConnected ? 'Live' : 'Déconnecté'}
        </span>
      </div>
      <h2 className="text-sm font-semibold text-white tracking-tight shrink-0">
        Trains en retard ({delayedTrains.length})
      </h2>
      {delayedTrains.length === 0 ? (
        <p className="text-zinc-600 text-xs">Aucun train en retard</p>
      ) : (
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1
          [&::-webkit-scrollbar]:w-0.75
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-white/25">
          {delayedTrains.map((train, i) => {
            const isHovered = hoveredTrainId === train.trainId;
            return (
              <div
                key={`${train.trainId}-${i}`}
                className={`p-3 rounded-xl border border-white/6 border-l-2 ${delayBorderColor(train.delaySeconds)} cursor-pointer transition-colors duration-100 ${isHovered ? 'bg-white/8' : 'bg-white/3'}`}
                onClick={() => setSelectedTrainId(train.trainId)}
                onMouseEnter={() => setHoveredTrainId(train.trainId)}
                onMouseLeave={() => setHoveredTrainId(null)}
              >
                <p className="text-zinc-200 text-xs font-medium">{train.lineName}</p>
                {train.nextStopName && (
                  <p className="text-zinc-400 text-xs mt-0.5">{train.nextStopName}</p>
                )}
                <p className="text-zinc-500 text-xs mt-1">
                  +{Math.round(train.delaySeconds / 60)} min de retard
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
