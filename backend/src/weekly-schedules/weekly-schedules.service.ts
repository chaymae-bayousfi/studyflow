import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { GenerateScheduleDto } from './dto/generate-schedule.dto';

@Injectable()
export class WeeklySchedulesService {
  constructor(
    private prisma: PrismaService,
  ) {}

    private getDayIndex(day: string) {
    const days = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
    };

    return days[day];
    }
  async generate(
    userId: string,
    dto: GenerateScheduleDto,
  ) {
    const weekStart = new Date(
      dto.week_start,
    );

    const existingSchedule =
      await this.prisma.weekly_schedules.findFirst({
        where: {
          user_id: userId,
          week_start: weekStart,
        },
      });

    if (existingSchedule) {
      throw new BadRequestException(
        'Schedule already exists for this week',
      );
    }

    const subjects =
      await this.prisma.subjects.findMany({
        where: {
          user_id: userId,
        },
      });

    if (subjects.length === 0) {
      throw new BadRequestException(
        'No subjects found',
      );
    }

    const availabilities =
      await this.prisma.availabilities.findMany({
        where: {
          user_id: userId,
        },
      });

    if (availabilities.length === 0) {
      throw new BadRequestException(
        'No availabilities found',
      );
    }

    const schedule =
      await this.prisma.weekly_schedules.create({
        data: {
          user_id: userId,

          week_start: weekStart,

          total_planned_hours: 0,
        },
      });

    let totalHours = 0;

    for (
    let i = 0;
    i <
    Math.min(
        subjects.length,
        availabilities.length,
    );
    i++
    ) {
    const subject = subjects[i];

    const availability =
        availabilities[i];

    let sessionsCount = 1;

    if (subject.priority === 'medium') {
        sessionsCount = 2;
    }

    if (subject.priority === 'high') {
        sessionsCount = 3;
    }

    if (subject.priority === 'critical') {
        sessionsCount = 4;
    }

    for (
        let sessionIndex = 0;
        sessionIndex < sessionsCount;
        sessionIndex++
    ) {

        const sessionDate = new Date(
        weekStart,
        );

        const dayIndex =
        this.getDayIndex(
            availability.day,
        );

        sessionDate.setDate(
        weekStart.getDate() +
            dayIndex +
            sessionIndex,
        );

        const startTime = new Date(
        availability.start_time,
        );

        const endTime = new Date(
        availability.end_time,
        );

        const start = new Date(
        sessionDate,
        );

        start.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        0,
        );

        const end = new Date(start);

        end.setHours(
        start.getHours() + 2,
        );

        if (end > endTime) {
        continue;
        }

        const overlapping =
        await this.prisma.study_sessions.findFirst({
            where: {
            user_id: userId,

            planned_start: {
                lt: end,
            },

            planned_end: {
                gt: start,
            },
            },
        });

        if (overlapping) {
        continue;
        }

        await this.prisma.study_sessions.create({
        data: {
            user_id: userId,

            subject_id: subject.id,

            weekly_schedule_id:
            schedule.id,

            title:
            `${subject.name} Study Session`,

            planned_start: start,

            planned_end: end,

            priority:
            subject.priority as any,
        },
        });

        totalHours += 2;
    }
    }

    await this.prisma.weekly_schedules.update({
      where: {
        id: schedule.id,
      },

      data: {
        total_planned_hours:
          totalHours,
      },
    });

    return this.prisma.weekly_schedules.findUnique({
      where: {
        id: schedule.id,
      },

      include: {
        study_sessions: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.weekly_schedules.findMany({
      where: {
        user_id: userId,
      },

      include: {
        study_sessions: true,
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }
}