import { Test, TestingModule } from '@nestjs/testing';
import { WeeklySchedulesController } from './weekly-schedules.controller';

describe('WeeklySchedulesController', () => {
  let controller: WeeklySchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklySchedulesController],
    }).compile();

    controller = module.get<WeeklySchedulesController>(WeeklySchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
