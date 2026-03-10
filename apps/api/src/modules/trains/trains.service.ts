import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainPosition } from './train-position.entity';

@Injectable()
export class TrainsService {
  constructor(
    @InjectRepository(TrainPosition)
    private readonly trainRepo: Repository<TrainPosition>,
  ) {}

  findLatest(): Promise<TrainPosition[]> {
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
}