'use client';

import { useTrainStore } from '../../stores/trainStore';

function delayBorderColor(seconds: number): string {
  if (seconds >= 900) return 'border-l-red-500';
  if (seconds >= 300) return 'border-l-orange-400';
  return 'border-l-yellow-400';
}

export function AlertsFeed() {
  const trains = useTrainStore((s) => s.trains);

  const delayedTrains = trains
    .filter((t) => t.delaySeconds > 0)
    .sort((a, b) => b.delaySeconds - a.delaySeconds);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
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
          {delayedTrains.map((train, i) => (
            <div
              key={`${train.trainId}-${i}`}
              className={`p-3 rounded-xl bg-white/3 border border-white/6 border-l-2 ${delayBorderColor(train.delaySeconds)}`}
            >
              <p className="text-zinc-200 text-xs font-medium">{train.lineName}</p>
              {train.nextStopName && (
                <p className="text-zinc-400 text-xs mt-0.5">{train.nextStopName}</p>
              )}
              <p className="text-zinc-500 text-xs mt-1">
                +{Math.round(train.delaySeconds / 60)} min de retard
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
