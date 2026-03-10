import { Controller, Get, Param } from '@nestjs/common';
import { TrainsService } from './trains.service';

@Controller('trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Get()
  findLatest() {
    return this.trainsService.findLatest();
  }

  @Get('line/:lineId')
  findByLine(@Param('lineId') lineId: string) {
    return this.trainsService.findByLine(lineId);
  }
}