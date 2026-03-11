'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTrainStore } from '../stores/trainStore';

let socket: ReturnType<typeof io> | null = null;

export function useSocket() {
  const { setTrains, setConnected } = useTrainStore();

  useEffect(() => {
    if (socket) return;

    socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/realtime`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
      fetch(`${process.env.NEXT_PUBLIC_WS_URL}/api/trains`)
        .then((r) => r.json())
        .then(setTrains)
        .catch(() => {});
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('trains_update', setTrains);

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);
}
