import { Injectable } from '@nestjs/common';
import { TrainsService } from '../trains/trains.service';

export interface LineStressScore {
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

@Injectable()
export class StressScoreService {
  constructor(private readonly trainsService: TrainsService) { }

  async computeAll(): Promise<LineStressScore[]> {
    const trains = await this.trainsService.findLatest();
    if (!trains.length) return [];

    // Grouper les trains par ligne
    const byLine = new Map<string, typeof trains>();
    for (const train of trains) {
      const group = byLine.get(train.lineId) ?? [];
      group.push(train);
      byLine.set(train.lineId, group);
    }

    const results: LineStressScore[] = [];

    for (const [lineId, lineTrains] of byLine) {
      const avgDelay =
        lineTrains.reduce((sum, t) => sum + t.delaySeconds, 0) /
        lineTrains.length;

      // Score normalisé : 15min de retard moyen = score 1.0
      const score = Math.min(1, avgDelay / 900);

      const avgLat = lineTrains.reduce((sum, t) => sum + t.lat, 0) / lineTrains.length;
      const avgLon = lineTrains.reduce((sum, t) => sum + t.lon, 0) / lineTrains.length;

      results.push({
        lineId,
        lineName: `Ligne ${lineId}`,
        score: Math.round(score * 100) / 100,
        level: this.toLevel(score),
        trainCount: lineTrains.length,
        avgDelaySeconds: Math.round(avgDelay),
        avgLat: Math.round(avgLat * 10000) / 10000,
        avgLon: Math.round(avgLon * 10000) / 10000,
        computedAt: new Date().toISOString(),
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private toLevel(score: number): LineStressScore['level'] {
    if (score < 0.25) return 'LOW';
    if (score < 0.5) return 'MEDIUM';
    if (score < 0.75) return 'HIGH';
    return 'CRITICAL';
  }
}