'use client';

import { useTrainStore } from '../../stores/trainStore';

const LEVEL_STYLES = {
  LOW:      { bar: 'bg-green-500',  badge: 'bg-green-900 text-green-300' },
  MEDIUM:   { bar: 'bg-yellow-500', badge: 'bg-yellow-900 text-yellow-300' },
  HIGH:     { bar: 'bg-orange-500', badge: 'bg-orange-900 text-orange-300' },
  CRITICAL: { bar: 'bg-red-500',    badge: 'bg-red-900 text-red-300' },
};

export function StressPanel() {
  const { stressScores, isConnected, lastUpdated } = useTrainStore();

  return (
    <div className="flex flex-col gap-3">
      {lastUpdated && (
        <p className="text-xs text-gray-500">
          Dernière mise à jour : {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Index de Stress</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
          {isConnected ? '● Live' : '○ Déconnecté'}
        </span>
      </div>

      {stressScores.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun retard pour le moment</p>
      ) : (
        stressScores.map((s) => {
          const style = LEVEL_STYLES[s.level];
          return (
            <div key={s.lineId} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium truncate">{s.lineName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${style.badge}`}>
                  {s.level}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${style.bar}`}
                  style={{ width: `${s.score * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{s.trainCount} train{s.trainCount > 1 ? 's' : ''}</span>
                <span>+{Math.round(s.avgDelaySeconds / 60)} min</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}