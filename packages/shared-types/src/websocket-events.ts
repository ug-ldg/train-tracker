import type { Train } from './train.types';
import type { StressScore } from './stress.types';

// Server → Client
export interface ServerToClientEvents {
  position_update: (trains: Train[]) => void;
  stress_update: (scores: StressScore[]) => void;
  alert: (payload: AlertPayload) => void;
}

export interface AlertPayload {
  lineId: string;
  level: StressScore['level'];
  message: string;
  triggeredAt: string;
}

// Client → Server
export interface ClientToServerEvents {
  subscribe_line: (lineId: string) => void;
}