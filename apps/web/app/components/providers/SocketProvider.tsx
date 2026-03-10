'use client';

import { useSocket } from '../../hooks/useSocket';
import { useTrainStore } from '../../stores/trainStore';

export function SocketProvider({ children }: { children: React.ReactNode }) {

    useSocket(); // initialise la connexion WebSocket au montage

    return <>{children}</>;
}