import { Controller, Get } from '@nestjs/common';
import { StressScoreService } from './stress-score.service';

@Controller('stress')
export class StressScoreController {
  constructor(private readonly stressScoreService: StressScoreService) {}

  @Get()
  computeAll() {
    return this.stressScoreService.computeAll();
  }
}