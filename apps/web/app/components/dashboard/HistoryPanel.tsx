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
        <div className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-white tracking-tight">Historique</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest">Début</label>
                    <input
                        type="datetime-local"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="bg-zinc-900 border border-white/6 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest">Fin</label>
                    <input
                        type="datetime-local"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="bg-zinc-900 border border-white/6 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white/6 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-all border border-white/6"
                >
                    {loading ? 'Chargement...' : 'Afficher'}
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}

            {!loading && historyTrains.length > 0 && (
                <p className="text-zinc-600 text-xs">
                    {historyTrains.length} ensemble{historyTrains.length > 1 ? 's' : ''} de perturbation{historyTrains.length > 1 ? 's' : ''}
                </p>
            )}

            {!loading && historyTrains.length === 0 && from && to && (
                <p className="text-zinc-600 text-xs">Aucune perturbation sur cette plage.</p>
            )}
        </div>
    );
}
