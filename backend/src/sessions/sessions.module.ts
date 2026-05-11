import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

import { SubjectGoalsModule } from '../subject-goals/subject-goals.module';

@Module({
  imports: [PrismaModule, SubjectGoalsModule],

  controllers: [SessionsController],

  providers: [SessionsService],
})
export class SessionsModule {}