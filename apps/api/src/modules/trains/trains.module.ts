import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainPosition } from './train-position.entity';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainPosition])],
  controllers: [TrainsController],
  providers: [TrainsService],
  exports: [TypeOrmModule, TrainsService],
})
export class TrainsModule {}
