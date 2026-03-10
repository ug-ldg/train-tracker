'use client';

import dynamic from 'next/dynamic';
import { StressPanel } from '../components/dashboard/StressPanel';
import { AlertsFeed } from '../components/dashboard/AlertsFeed';

// Désactive le SSR pour Leaflet (incompatible avec le rendu serveur)
const TrainMap = dynamic(
  () => import('../components/map/TrainMap').then((m) => m.TrainMap),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-gray-600">Chargement de la carte...</div> }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <aside className="w-80 shrink-0 bg-gray-950 border-r border-gray-800 p-4 overflow-y-auto flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-bold text-white">Train Tracker</h1>
          <p className="text-gray-500 text-xs mt-1">SNCF Real-time Monitor</p>
        </div>
        <StressPanel />
        <AlertsFeed />
      </aside>

      <main className="flex-1">
        <TrainMap />
      </main>
    </div>
  );
}