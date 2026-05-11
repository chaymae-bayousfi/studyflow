import { Module } from '@nestjs/common';

import { PrismaModule }
from '../prisma/prisma.module';

import { RemindersService }
from './reminders.service';

@Module({
  imports: [PrismaModule],

  providers: [RemindersService],
})
export class RemindersModule {}