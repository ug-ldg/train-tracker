import { Test, TestingModule } from '@nestjs/testing';
import { StressScoreService } from './stress-score.service';

describe('StressScoreService', () => {
  let service: StressScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StressScoreService],
    }).compile();

    service = module.get<StressScoreService>(StressScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
