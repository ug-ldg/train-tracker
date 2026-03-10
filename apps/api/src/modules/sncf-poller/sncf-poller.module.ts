import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TrainsModule } from '../trains/trains.module';
import { StressScoreModule } from '../stress-score/stress-score.module';
import { AlertsModule } from '../alerts/alerts.module';
import { PollerService } from './poller.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), TrainsModule, StressScoreModule, AlertsModule],
  providers: [PollerService],
})
export class SncfPollerModule {}