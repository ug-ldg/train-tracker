'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTrainStore } from '../stores/trainStore';

let socket: ReturnType<typeof io> | null = null;

export function useSocket() {
  const { setStressScores, addAlert, setConnected } = useTrainStore();

  useEffect(() => {
    if (socket) return; // connexion déjà établie

    socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/realtime`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      fetch(`${process.env.NEXT_PUBLIC_WS_URL}/api/stress`)
        .then((r) => r.json())
        .then(setStressScores)
        .catch(() => {});
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('stress_update', setStressScores);
    socket.on('alert', addAlert);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);
}