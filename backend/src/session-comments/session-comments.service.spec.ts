import { Test, TestingModule } from '@nestjs/testing';
import { SessionCommentsService } from './session-comments.service';

describe('SessionCommentsService', () => {
  let service: SessionCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionCommentsService],
    }).compile();

    service = module.get<SessionCommentsService>(SessionCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
