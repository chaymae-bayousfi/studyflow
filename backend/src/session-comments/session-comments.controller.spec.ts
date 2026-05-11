import { Test, TestingModule } from '@nestjs/testing';
import { SessionCommentsController } from './session-comments.controller';

describe('SessionCommentsController', () => {
  let controller: SessionCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionCommentsController],
    }).compile();

    controller = module.get<SessionCommentsController>(SessionCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
