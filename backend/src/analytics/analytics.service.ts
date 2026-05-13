import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async dashboard(userId: string) {
    const totalSessions =
      await this.prisma.study_sessions.count({
        where: {
          user_id: userId,
        },
      });

    const completedSessions =
      await this.prisma.study_sessions.count({
        where: {
          user_id: userId,

          status: 'completed',
        },
      });

    const sessions =
      await this.prisma.study_sessions.findMany({
        where: {
          user_id: userId,

          status: 'completed',
        },
      });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    let totalMinutes = 0;
    let weeklyMinutes = 0;
    let productivitySum = 0;
    let productivityCount = 0;

    let thisWeekTotal = 0;
    let thisWeekCompleted = 0;
    let lastWeekTotal = 0;
    let lastWeekCompleted = 0;

    sessions.forEach((session) => {
      const start = new Date(session.planned_start);
      const end = new Date(session.planned_end);
      const minutes = (end.getTime() - start.getTime()) / 1000 / 60;

      totalMinutes += minutes;

      if (start >= startOfWeek) {
        weeklyMinutes += minutes;
      }

      if (session.productivity_rating) {
        productivitySum += session.productivity_rating;
        productivityCount++;
      }
    });

    const allSessions = await this.prisma.study_sessions.findMany({
      where: { user_id: userId },
    });

    allSessions.forEach((s) => {
      const start = new Date(s.planned_start);
      if (start >= startOfWeek) {
        thisWeekTotal++;
        if (s.status === 'completed') thisWeekCompleted++;
      } else if (start >= startOfLastWeek && start < startOfWeek) {
        lastWeekTotal++;
        if (s.status === 'completed') lastWeekCompleted++;
      }
    });

    const thisWeekRate = thisWeekTotal ? (thisWeekCompleted / thisWeekTotal) * 100 : 0;
    const lastWeekRate = lastWeekTotal ? (lastWeekCompleted / lastWeekTotal) * 100 : 0;
    const completionRateDelta = thisWeekRate - lastWeekRate;

    return {
      totalSessions,
      completedSessions,
      totalStudyHours: Number((totalMinutes / 60).toFixed(2)),
      weeklyStudyHours: Number((weeklyMinutes / 60).toFixed(2)),
      completionRateDelta: Number(completionRateDelta.toFixed(1)),
      averageProductivity: productivityCount > 0 ? Number((productivitySum / productivityCount).toFixed(2)) : 0,
    };
  }

  async weeklyStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.study_sessions.findMany({
      where: {
        user_id: userId,
        planned_start: {
          gte: startOfWeek,
        },
      },
      orderBy: {
        planned_start: 'asc',
      },
    });

    const daysMap = {
      0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
    };

    const stats: any = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
    };

    sessions.forEach((session) => {
      const start = new Date(session.planned_start);
      const end = new Date(session.planned_end);
      const hours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
      const day = daysMap[start.getDay() as keyof typeof daysMap];
      stats[day] += hours;
    });

    return {
      days: Object.keys(stats).map((day) => ({
        day,
        hours: Number(stats[day].toFixed(2)),
      })),
    };
  }

    async subjectStats(userId: string) {
    const sessions =
        await this.prisma.study_sessions.findMany({
        where: {
            user_id: userId,
        },

        include: {
            subjects: true,
        },
        });

    const stats: any = {};

    sessions.forEach((session) => {
        if (!session.subjects) return;

        const start =
        new Date(session.planned_start);

        const end =
        new Date(session.planned_end);

        const hours =
        (end.getTime() -
            start.getTime()) /
        1000 /
        60 /
        60;

        const subjectName =
        session.subjects.name;

        if (!stats[subjectName]) {
        stats[subjectName] = 0;
        }

        stats[subjectName] += hours;
    });

    return Object.keys(stats).map(
        (subject) => ({
        subject,

        hours: Number(
            stats[subject].toFixed(2),
        ),
        }),
    );
    }

    async leaderboard() {
    const users =
      await this.prisma.users.findMany({
        select: {
          id: true,

          first_name: true,

          last_name: true,

          xp_points: true,

          level: true,

          streak_days: true,
        },

        orderBy: {
          xp_points: 'desc',
        },

        take: 10,
      });

    return users.map((user, index) => ({
      rank: index + 1,

      id: user.id,

      name:
        `${user.first_name} ${user.last_name}`,

      xp_points: user.xp_points,

      level: user.level,

      streak_days: user.streak_days,
    }));
  }
}