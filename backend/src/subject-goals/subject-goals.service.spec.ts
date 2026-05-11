import { Test, TestingModule } from '@nestjs/testing';
import { SubjectGoalsService } from './subject-goals.service';

describe('SubjectGoalsService', () => {
  let service: SubjectGoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubjectGoalsService],
    }).compile();

    service = module.get<SubjectGoalsService>(SubjectGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
