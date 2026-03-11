import { Controller, Get, Param, Query, BadRequestException } from '@nestjs/common';
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

  @Get('history')
  findHistory(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) throw new BadRequestException('from and to are required');
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return this.trainsService.findDisruptionSessions(fromDate, toDate);
  }
}