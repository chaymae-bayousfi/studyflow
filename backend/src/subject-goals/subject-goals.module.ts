import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { SubjectGoalsController } from './subject-goals.controller';
import { SubjectGoalsService } from './subject-goals.service';

@Module({
  imports: [PrismaModule],

  controllers: [SubjectGoalsController],

 providers: [SubjectGoalsService],

  exports: [SubjectGoalsService],
})
export class SubjectGoalsModule {}