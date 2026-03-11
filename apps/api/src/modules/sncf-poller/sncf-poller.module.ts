import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TrainsModule } from '../trains/trains.module';
import { AlertsModule } from '../alerts/alerts.module';
import { PollerService } from './poller.service';

@Module({
  imports: [HttpModule, ScheduleModule.forRoot(), TrainsModule, AlertsModule],
  providers: [PollerService],
})
export class SncfPollerModule {}