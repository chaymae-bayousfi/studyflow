import { Test, TestingModule } from '@nestjs/testing';
import { WeeklySchedulesService } from './weekly-schedules.service';

describe('WeeklySchedulesService', () => {
  let service: WeeklySchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklySchedulesService],
    }).compile();

    service = module.get<WeeklySchedulesService>(WeeklySchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
