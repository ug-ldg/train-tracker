import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { TrainPosition } from './train-position.entity';

@Injectable()
export class TrainsService {
  constructor(
    @InjectRepository(TrainPosition)
    private readonly trainRepo: Repository<TrainPosition>,
  ) {}

  findLatest(): Promise<TrainPosition[]> {
    const cutoff = new Date(Date.now() - 2 * 60 * 1000);
    return this.trainRepo
      .createQueryBuilder('tp')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('MAX(inner.recorded_at)')
          .from(TrainPosition, 'inner')
          .where('inner.train_id = tp.train_id')
          .getQuery();
        return `tp.recorded_at = ${sub}`;
      })
      .andWhere('tp.recorded_at > :cutoff', { cutoff })
      .orderBy('tp.line_id', 'ASC')
      .getMany();
  }

  findByLine(lineId: string): Promise<TrainPosition[]> {
    return this.trainRepo.find({
      where: { lineId },
      order: { recordedAt: 'DESC' },
      take: 50,
    });
  }

  save(data: Partial<TrainPosition>): Promise<TrainPosition> {
    const entity = this.trainRepo.create(data);
    return this.trainRepo.save(entity);
  }

  saveMany(data: Partial<TrainPosition>[]): Promise<TrainPosition[]> {
    const entities = this.trainRepo.create(data);
    return this.trainRepo.save(entities);
  }

  async findDisruptionSessions(from: Date, to: Date): Promise<{
    trainId: string; lineId: string; lineName: string;
    lat: number; lon: number; delaySeconds: number;
    delayStatus: string; nextStopName: string;
    firstSeen: string; lastSeen: string;
  }[]> {
    const GAP_MS = 5 * 60 * 1000;

    const records = await this.trainRepo.find({
      where: { recordedAt: Between(from, to) },
      order: { trainId: 'ASC', recordedAt: 'ASC' },
    });

    const sessions: {
      trainId: string; lineId: string; lineName: string;
      lat: number; lon: number; delaySeconds: number;
      delayStatus: string; nextStopName: string;
      firstSeen: string; lastSeen: string;
    }[] = [];

    const byTrain = new Map<string, TrainPosition[]>();
    for (const r of records) {
      if (!byTrain.has(r.trainId)) byTrain.set(r.trainId, []);
      byTrain.get(r.trainId)!.push(r);
    }

    for (const trainRecords of byTrain.values()) {
      let sessionStart = 0;

      for (let i = 1; i <= trainRecords.length; i++) {
        const isLast = i === trainRecords.length;
        const hasGap = !isLast &&
          (trainRecords[i].recordedAt.getTime() - trainRecords[i - 1].recordedAt.getTime()) > GAP_MS;

        if (isLast || hasGap) {
          const chunk = trainRecords.slice(sessionStart, i);
          const avgDelay = Math.round(chunk.reduce((s, r) => s + r.delaySeconds, 0) / chunk.length);
          const peak = chunk.reduce((max, r) => r.delaySeconds > max.delaySeconds ? r : max);

          sessions.push({
            trainId: chunk[0].trainId,
            lineId: chunk[0].lineId,
            lineName: chunk[0].lineName,
            lat: peak.lat,
            lon: peak.lon,
            delaySeconds: avgDelay,
            delayStatus: peak.delayStatus,
            nextStopName: peak.nextStopName,
            firstSeen: chunk[0].recordedAt.toISOString(),
            lastSeen: chunk[chunk.length - 1].recordedAt.toISOString(),
          });

          sessionStart = i;
        }
      }
    }

    return sessions;
  }
}