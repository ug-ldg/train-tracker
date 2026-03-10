export type DelayStatus = 'ON_TIME' | 'SLIGHT' | 'LATE' | 'VERY_LATE';

export interface Train {
  id: string;
  lineId: string;
  lineName: string;
  lat: number;
  lon: number;
  delaySeconds: number;
  status: DelayStatus;
  updatedAt: string; // ISO 8601
}