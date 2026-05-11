import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateSubjectGoalDto } from './dto/create-subject-goal.dto';

@Injectable()
export class SubjectGoalsService {
  constructor(
    private prisma: PrismaService,
  ) {}
  private getWeekStart(date: Date) {
    const result = new Date(date);

    const day = result.getDay();

    const diff =
        result.getDate() -
        day +
        (day === 0 ? -6 : 1);

    result.setDate(diff);

    result.setHours(0, 0, 0, 0);

    return result;
    }
  async create(
    userId: string,
    dto: CreateSubjectGoalDto,
  ) {
    const existingGoal =
      await this.prisma.subject_goals.findFirst({
        where: {
          user_id: userId,

          subject_id: dto.subject_id,

          week_start: new Date(dto.week_start),
        },
      });

    if (existingGoal) {
      throw new BadRequestException(
        'Goal already exists for this week',
      );
    }

    return this.prisma.subject_goals.create({
      data: {
        user_id: userId,

        subject_id: dto.subject_id,

        week_start: new Date(dto.week_start),

        target_hours: dto.target_hours,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.subject_goals.findMany({
      where: {
        user_id: userId,
      },

      include: {
        subjects: true,
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateProgress(
    userId: string,
    subjectId: string,
    studiedHours: number,
    sessionTitle: string,
    ) {
    const weekStart =
        this.getWeekStart(new Date());

    const goal =
        await this.prisma.subject_goals.findFirst({
        where: {
            user_id: userId,

            subject_id: subjectId,

            week_start: weekStart,
        },

        include: {
            subjects: true,
        },
        });

    if (!goal) {
        return null;
    }

    const achieved =
        Number(goal.achieved_hours) +
        studiedHours;

    const completed =
        achieved >= Number(goal.target_hours);

    const updatedGoal =
        await this.prisma.subject_goals.update({
        where: {
            id: goal.id,
        },

        data: {
            achieved_hours: achieved,

            is_completed: completed,
        },
        });

    if (
        completed &&
        !goal.is_completed
    ) {
        await this.prisma.notifications.create({
        data: {
            user_id: userId,

            type: 'goal_achieved',

            title: 'Goal achieved 🎉',

            body:
            `You completed your weekly goal for ${goal.subjects.name}`,

            data: {
            subject_id: subjectId,

            session: sessionTitle,
            },
        },
        });
    }

    return updatedGoal;
    }
}