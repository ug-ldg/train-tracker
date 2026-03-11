'use client';

import { useTrainStore } from '../../stores/trainStore';

const LEVEL_DOT: Record<string, string> = {
  LOW:      'bg-emerald-500',
  MEDIUM:   'bg-yellow-400',
  HIGH:     'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const LEVEL_BAR: Record<string, string> = {
  LOW:      'bg-emerald-500',
  MEDIUM:   'bg-yellow-400',
  HIGH:     'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export function StressPanel() {
  const { stressScores, isConnected, lastUpdated } = useTrainStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Titre + statut */}
      <div className="flex items-center justify-between">
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

      <h2 className="text-sm font-semibold text-white tracking-tight mt-2">Index de Stress</h2>

      {stressScores.length === 0 ? (
        <p className="text-zinc-600 text-xs">Aucun retard pour le moment</p>
      ) : (
        <div className="flex flex-col gap-2">
          {stressScores.map((s) => (
            <div key={s.lineId} className="p-3 rounded-xl bg-white/3 border border-white/6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-white text-xs font-medium truncate">{s.lineName}</span>
                <span className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${LEVEL_DOT[s.level]}`} />
                  <span className="text-zinc-500 text-xs">{s.level}</span>
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-0.5">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${LEVEL_BAR[s.level]}`}
                  style={{ width: `${s.score * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-2">
                <span>{s.trainCount} train{s.trainCount > 1 ? 's' : ''}</span>
                <span>+{Math.round(s.avgDelaySeconds / 60)} min</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
