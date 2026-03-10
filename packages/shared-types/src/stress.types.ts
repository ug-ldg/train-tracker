export type StressLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StressScore {
  lineId: string;
  lineName: string;
  score: number;       // 0.0 → 1.0
  level: StressLevel;
  trainCount: number;
  computedAt: string;  // ISO 8601
}