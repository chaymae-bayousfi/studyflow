import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.users.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        xp_points: true,
        level: true,
        streak_days: true,
        weekly_goal_hours: true,
        created_at: true,
      },
    });
  }
}