import { Module } from '@nestjs/common';
import { TrainsModule } from '../trains/trains.module';
import { StressScoreService } from './stress-score.service';
import { StressScoreController } from './stress-score.controller';

@Module({
  imports: [TrainsModule],
  providers: [StressScoreService],
  controllers: [StressScoreController],
  exports: [StressScoreService],
})
export class StressScoreModule {}