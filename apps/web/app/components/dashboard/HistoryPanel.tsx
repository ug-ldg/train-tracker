'use client';

import { useState } from 'react';
import { useTrainStore } from '../../stores/trainStore';

export function HistoryPanel() {
    const setHistoryTrains = useTrainStore((s) => s.setHistoryTrains);
    const historyTrains = useTrainStore((s) => s.historyTrains);

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!from || !to) return;

        setLoading(true);
        setError(null);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_WS_URL ?? '';
            const fromIso = new Date(from).toISOString();
            const toIso = new Date(to).toISOString();
            const res = await fetch(`${baseUrl}/api/trains/history?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`);
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const data = await res.json();
            setHistoryTrains(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Début</label>
                    <input
                        type="datetime-local"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Fin</label>
                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2 rounded transition-colors"
                >
                    {loading ? 'Chargement...' : 'Afficher'}
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}

            {!loading && historyTrains.length > 0 && (
                <p className="text-gray-400 text-xs">
                    {historyTrains.length} enregistrement{historyTrains.length > 1 ? 's' : ''} trouvé{historyTrains.length > 1 ? 's' : ''}
                </p>
            )}

            {!loading && historyTrains.length === 0 && from && to && (
                <p className="text-gray-500 text-xs">Aucune perturbation sur cette plage.</p>
            )}
        </div>
    );
}
