'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTrainStore, StressScore } from '../stores/trainStore';

let socket: ReturnType<typeof io> | null = null;

export function useSocket() {
  const { setStressScores, setTrains, setAlerts, setConnected } = useTrainStore();

  useEffect(() => {
    if (socket) return; // connexion déjà établie

    socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/realtime`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      fetch(`${process.env.NEXT_PUBLIC_WS_URL}/api/stress`)
        .then((r) => r.json())
        .then((scores: StressScore[]) => {
          setStressScores(scores);
          setAlerts(
            scores
              .filter((s) => s.level === 'CRITICAL' || s.level === 'HIGH')
              .map((s) => ({
                lineId: s.lineId,
                level: s.level,
                message: `${s.lineName} : retard moyen ${Math.round(s.avgDelaySeconds / 60)} min`,
                triggeredAt: new Date().toISOString(),
              })),
          );
        })
        .catch(() => {});
      fetch(`${process.env.NEXT_PUBLIC_WS_URL}/api/trains`)
        .then((r) => r.json())
        .then(setTrains)
        .catch(() => {});
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('stress_update', setStressScores);
    socket.on('trains_update', setTrains);
    socket.on('active_alerts', setAlerts);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);
}