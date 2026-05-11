import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { SessionCommentsController } from './session-comments.controller';
import { SessionCommentsService } from './session-comments.service';

@Module({
  imports: [PrismaModule],

  controllers: [SessionCommentsController],

  providers: [SessionCommentsService],
})
export class SessionCommentsModule {}