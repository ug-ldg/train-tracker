import { create } from 'zustand';

export interface TrainPosition {
  trainId: string;
  lineId: string;
  lineName: string;
  lat: number;
  lon: number;
  delaySeconds: number;
  delayStatus: string;
  nextStopName: string;
  firstSeen?: string;
  lastSeen?: string;
}

interface TrainStore {
  trains: TrainPosition[];
  isConnected: boolean;
  lastUpdated: Date | null;
  mode: 'realtime' | 'history';
  historyTrains: TrainPosition[];
  historyFrom: string;
  historyTo: string;
  selectedTrainId: string | null;
  hoveredTrainId: string | null;
  setTrains: (trains: TrainPosition[]) => void;
  setConnected: (connected: boolean) => void;
  setMode: (mode: 'realtime' | 'history') => void;
  setHistoryTrains: (trains: TrainPosition[]) => void;
  setHistoryFrom: (from: string) => void;
  setHistoryTo: (to: string) => void;
  setSelectedTrainId: (id: string | null) => void;
  setHoveredTrainId: (id: string | null) => void;
}

export const useTrainStore = create<TrainStore>((set) => ({
  trains: [],
  isConnected: false,
  lastUpdated: null,
  mode: 'realtime',
  historyTrains: [],
  historyFrom: '',
  historyTo: '',
  selectedTrainId: null,
  hoveredTrainId: null,
  setTrains: (trains) => set({ trains, lastUpdated: new Date() }),
  setConnected: (connected) => set({ isConnected: connected }),
  setMode: (mode) => set({ mode }),
  setHistoryTrains: (historyTrains) => set({ historyTrains }),
  setHistoryFrom: (historyFrom) => set({ historyFrom }),
  setHistoryTo: (historyTo) => set({ historyTo }),
  setSelectedTrainId: (selectedTrainId) => set({ selectedTrainId }),
  setHoveredTrainId: (hoveredTrainId) => set({ hoveredTrainId }),
}));
