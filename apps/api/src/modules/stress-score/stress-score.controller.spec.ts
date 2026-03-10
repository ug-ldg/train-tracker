import { Test, TestingModule } from '@nestjs/testing';
import { StressScoreController } from './stress-score.controller';

describe('StressScoreController', () => {
  let controller: StressScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StressScoreController],
    }).compile();

    controller = module.get<StressScoreController>(StressScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
