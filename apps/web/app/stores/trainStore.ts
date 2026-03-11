import { create } from 'zustand';

export interface StressScore {
  lineId: string;
  lineName: string;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trainCount: number;
  avgDelaySeconds: number;
  avgLat: number;
  avgLon: number;
  computedAt: string;
}

export interface Alert {
  lineId: string;
  level: string;
  message: string;
  triggeredAt: string;
}

export interface TrainPosition {
  trainId: string;
  lineId: string;
  lineName: string;
  lat: number;
  lon: number;
  delaySeconds: number;
  delayStatus: string;
  nextStopName: string;
}

interface TrainStore {
  stressScores: StressScore[];
  trains: TrainPosition[];
  alerts: Alert[];
  isConnected: boolean;
  lastUpdated: Date | null;
  mode: 'realtime' | 'history';
  historyTrains: TrainPosition[];
  setStressScores: (scores: StressScore[]) => void;
  setTrains: (trains: TrainPosition[]) => void;
  addAlert: (alert: Alert) => void;
  setConnected: (connected: boolean) => void;
  setMode: (mode: 'realtime' | 'history') => void;
  setHistoryTrains: (trains: TrainPosition[]) => void;
}

export const useTrainStore = create<TrainStore>((set) => ({
  stressScores: [],
  trains: [],
  alerts: [],
  isConnected: false,
  lastUpdated: null,
  mode: 'realtime',
  historyTrains: [],
  setStressScores: (scores) => set({ stressScores: scores, lastUpdated: new Date() }),
  setTrains: (trains) => set({ trains }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 20), // max 20 alertes
    })),
  setConnected: (connected) => set({ isConnected: connected }),
  setMode: (mode) => set({ mode }),
  setHistoryTrains: (historyTrains) => set({ historyTrains }),
}));