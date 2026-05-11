import { Test, TestingModule } from '@nestjs/testing';
import { SubjectGoalsController } from './subject-goals.controller';

describe('SubjectGoalsController', () => {
  let controller: SubjectGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectGoalsController],
    }).compile();

    controller = module.get<SubjectGoalsController>(SubjectGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
