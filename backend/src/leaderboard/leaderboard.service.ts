import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async topUsers() {
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

    return users.map(
      (user, index) => ({
        rank: index + 1,

        ...user,
      }),
    );
  }

  async topStreaks() {
    const users =
      await this.prisma.users.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          streak_days: true,
          level: true,
        },

        orderBy: {
          streak_days: 'desc',
        },

        take: 10,
      });

    return users.map(
      (user, index) => ({
        rank: index + 1,

        ...user,
      }),
    );
  }

  async topLevels() {
    const users =
      await this.prisma.users.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          level: true,
          xp_points: true,
        },

        orderBy: {
          level: 'desc',
        },

        take: 10,
      });

    return users.map(
      (user, index) => ({
        rank: index + 1,

        ...user,
      }),
    );
  }
}