'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
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
  const trains = useTrainStore((s) => s.trains);
  const isConnected = useTrainStore((s) => s.isConnected);
  const historyTrains = useTrainStore((s) => s.historyTrains);

  const [panelExpanded, setPanelExpanded] = useState(false);

  const delayedCount = trains.filter((t) => t.delaySeconds > 0).length;

  function switchMode(next: 'realtime' | 'history') {
    setMode(next);
    if (next === 'realtime') setHistoryTrains([]);
  }

  return (
    <div className="h-dvh bg-zinc-950 text-white flex flex-col md:flex-row overflow-hidden">

      {/* Carte — prend tout l'espace disponible */}
      <main className="flex-1 min-h-0 order-first md:order-last">
        <TrainMap />
      </main>

      {/* Panel — bottom sheet sur mobile, sidebar sur desktop */}
      <aside
        className={`
          order-last md:order-first
          w-full md:w-80 md:shrink-0
          bg-zinc-900/60 md:bg-zinc-900/40
          backdrop-blur-sm md:backdrop-blur-none
          border-t border-white/8 md:border-t-0 md:border-r md:border-white/6
          flex flex-col
          md:h-dvh md:p-5 md:gap-6
          overflow-hidden
          transition-[height] duration-300 ease-in-out
          ${panelExpanded ? 'h-[75dvh]' : 'h-14'}
          md:!h-dvh
        `}
      >
        {/* Handle mobile — tap pour ouvrir/fermer */}
        <div
          className="md:hidden flex flex-col items-center shrink-0 cursor-pointer select-none pt-2"
          onClick={() => setPanelExpanded((v) => !v)}
        >
          {/* Drag indicator */}
          <div className="w-8 h-1 rounded-full bg-white/20 mb-2" />

          {/* Résumé visible quand le panel est réduit */}
          <div className="flex items-center justify-between w-full px-4 pb-1.5">
            {mode === 'realtime' ? (
              <span className="text-white text-xs font-medium">
                {delayedCount > 0
                  ? `${delayedCount} train${delayedCount > 1 ? 's' : ''} en retard`
                  : 'Aucun retard'}
              </span>
            ) : (
              <span className="text-white text-xs font-medium">
                {historyTrains.length > 0
                  ? `${historyTrains.length} perturbation${historyTrains.length > 1 ? 's' : ''}`
                  : 'Historique'}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
                {isConnected ? 'Live' : 'Déconnecté'}
              </span>
              <span className="text-zinc-500 text-xs">
                {panelExpanded ? '▾' : '▴'}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu du panel — masqué dans le résumé réduit */}
        <div className={`flex flex-col gap-4 flex-1 min-h-0 overflow-hidden px-4 pb-4 md:px-0 md:pb-0 ${panelExpanded ? '' : 'hidden'} md:flex md:gap-6`}>

          {/* Header desktop */}
          <div className="hidden md:flex flex-col gap-0.5">
            <h1 className="text-base font-semibold tracking-tight text-white">Train Tracker</h1>
            <p className="text-zinc-500 text-xs">SNCF Real-time Monitor</p>
          </div>

          {/* Toggle de mode */}
          <div className="flex p-1 bg-zinc-800/60 rounded-lg text-xs gap-1 shrink-0">
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
            <div className="flex-1 min-h-0 flex flex-col">
              <AlertsFeed />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <HistoryPanel />
            </div>
          )}
        </div>

      </aside>
    </div>
  );
}
