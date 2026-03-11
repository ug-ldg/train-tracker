'use client';

import dynamic from 'next/dynamic';
import { StressPanel } from '../components/dashboard/StressPanel';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';
import { HistoryPanel } from '../components/dashboard/HistoryPanel';
import { useTrainStore } from '../stores/trainStore';

const TrainMap = dynamic(
  () => import('../components/map/TrainMap').then((m) => m.TrainMap),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">Chargement de la carte...</div> }
);

export default function DashboardPage() {
  const mode = useTrainStore((s) => s.mode);
  const setMode = useTrainStore((s) => s.setMode);
  const setHistoryTrains = useTrainStore((s) => s.setHistoryTrains);

  function switchMode(next: 'realtime' | 'history') {
    setMode(next);
    if (next === 'realtime') setHistoryTrains([]);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="w-80 shrink-0 bg-zinc-900/40 border-r border-white/6 p-5 overflow-y-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-semibold tracking-tight text-white">Train Tracker</h1>
          <p className="text-zinc-500 text-xs">SNCF Real-time Monitor</p>
        </div>

        {/* Toggle de mode */}
        <div className="flex p-1 bg-zinc-800/60 rounded-lg text-xs gap-1">
          <button
            onClick={() => switchMode('realtime')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
              mode === 'realtime'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Temps réel
          </button>
          <button
            onClick={() => switchMode('history')}
            className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
              mode === 'history'
                ? 'bg-zinc-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Historique
          </button>
        </div>

        {mode === 'realtime' ? (
          <>
            <StressPanel />
            <div className="border-t border-white/6" />
            <AlertsFeed />
          </>
        ) : (
          <HistoryPanel />
        )}
      </aside>

      <main className="flex-1">
        <TrainMap />
      </main>
    </div>
  );
}
