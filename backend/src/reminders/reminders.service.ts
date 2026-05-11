import {
  Injectable,
} from '@nestjs/common';

import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';

import { PrismaService }
from '../prisma/prisma.service';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  @Cron(
    CronExpression.EVERY_MINUTE,
  )
  async handleSessionReminders() {
    console.log(
      'Checking session reminders...',
    );

    const now = new Date();

    const in30Minutes = new Date(
      now.getTime() +
      30 * 60 * 1000,
    );

    const sessions =
      await this.prisma.study_sessions.findMany({
        where: {
          status: 'planned',

          planned_start: {
            gte: now,
            lte: in30Minutes,
          },
        },

        include: {
          users: true,
        },
      });

    for (const session of sessions) {
      const existingNotification =
        await this.prisma.notifications.findFirst({
          where: {
            user_id: session.user_id,

            title:
              `Reminder: ${session.title}`,
          },
        });

      if (existingNotification) {
        continue;
      }

      await this.prisma.notifications.create({
        data: {
          user_id: session.user_id,

          type: 'session_reminder',

          title:
            `Reminder: ${session.title}`,

          body:
            `Your study session starts at ${session.planned_start}`,

          scheduled_for:
            session.planned_start,
        },
      });

      console.log(
        `Reminder created for session ${session.title}`,
      );
    }
  }
}