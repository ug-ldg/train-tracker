'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTrainStore } from '../stores/trainStore';

let socket: ReturnType<typeof io> | null = null;

export function useSocket() {
  const { setStressScores, setTrains, addAlert, setConnected } = useTrainStore();

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
      fetch(`${process.env.NEXT_PUBLIC_WS_URL}/api/trains`)
        .then((r) => r.json())
        .then(setTrains)
        .catch(() => {});
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('stress_update', setStressScores);
    socket.on('trains_update', setTrains);
    socket.on('alert', addAlert);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);
}