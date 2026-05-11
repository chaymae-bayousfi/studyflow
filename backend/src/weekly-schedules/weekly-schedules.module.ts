import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { WeeklySchedulesController } from './weekly-schedules.controller';
import { WeeklySchedulesService } from './weekly-schedules.service';

@Module({
  imports: [PrismaModule],

  controllers: [WeeklySchedulesController],

  providers: [WeeklySchedulesService],
})
export class WeeklySchedulesModule {}