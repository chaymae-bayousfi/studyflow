import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SubjectGoalsService } from '../subject-goals/subject-goals.service';
import { ShareSessionDto } from './dto/share-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,

    private subjectGoalsService: SubjectGoalsService,
  ) {}
  private isSameDay(
    date1: Date,
    date2: Date,
  ) {
    return (
      date1.getFullYear() ===
        date2.getFullYear() &&
      date1.getMonth() ===
        date2.getMonth() &&
      date1.getDate() ===
        date2.getDate()
    );
  }
  async create(
    userId: string,
    dto: CreateSessionDto,
  ) {
    const start = new Date(dto.planned_start);
    const end = new Date(dto.planned_end);

    if (end <= start) {
      throw new BadRequestException(
        'End date must be after start date',
      );
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
      throw new BadRequestException(
        'Session overlaps another session',
      );
    }

    const subject = await this.prisma.subjects.findFirst({
        where: {
            id: dto.subject_id,
            user_id: userId,
        },
    });

    if (!subject) {
        throw new Error('Subject not found');
    }

    return this.prisma.study_sessions.create({
      data: {
        user_id: userId,

        title: dto.title,

        description: dto.description,

        subject_id: dto.subject_id,

        planned_start: start,

        planned_end: end,

        priority: (dto.priority ||
          'medium') as any,

        is_online: dto.is_online || false,

        meeting_url: dto.meeting_url,
      },
    });
  }

    async findAll(
    userId: string,
    subjectId?: string,
    ) {
    return this.prisma.study_sessions.findMany({
      where: {
        user_id: userId,

        ...(subjectId && {
            subject_id: subjectId,
        }),
        },

      include: {
        subjects: true,
      },

      orderBy: {
        planned_start: 'asc',
      },
    });
  }

  async update(
    userId: string,
    sessionId: string,
    dto: UpdateSessionDto,
  ) {
    const session =
      await this.prisma.study_sessions.findFirst({
        where: {
          id: sessionId,
          user_id: userId,
        },
      });

    if (
    session &&
    dto.status === 'completed' &&
    session.status !== 'completed'
  ) {
    if (session.subject_id) {
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

    await this.subjectGoalsService.updateProgress(
      userId,
      session.subject_id,
      hours,
      session.title,
    );
  }
    let earnedXp = 50;

    if (session.priority === 'medium') {
      earnedXp = 75;
    }

    if (session.priority === 'high') {
      earnedXp = 100;
    }

    if (session.priority === 'critical') {
      earnedXp = 150;
    }

    const user =
      await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

    const newXp =
      (user?.xp_points || 0) + earnedXp;

    const newLevel =
      Math.floor(newXp / 500) + 1;

    await this.prisma.users.update({
      where: {
        id: userId,
      },

      data: {
        xp_points: newXp,

        level: newLevel,

        streak_days: {
          increment: 1,
        },
      },
    });

    await this.updateUserStreak(
      userId,
    );
  }
    if (!session) {
      throw new BadRequestException(
        'Session not found',
      );
    }

    return this.prisma.study_sessions.update({
      where: {
        id: sessionId,
      },

      data: {
    ...(dto.title && {
      title: dto.title,
    }),

    ...(dto.description && {
      description: dto.description,
    }),

    ...(dto.subject_id && {
      subject_id: dto.subject_id,
    }),

    ...(dto.planned_start && {
      planned_start: new Date(
        dto.planned_start,
      ),
    }),

    ...(dto.planned_end && {
      planned_end: new Date(
        dto.planned_end,
      ),
    }),

    ...(dto.priority && {
      priority: dto.priority as any,
    }),

    ...(dto.status && {
      status: dto.status as any,
    }),

    ...(dto.productivity_rating && {
      productivity_rating:
        dto.productivity_rating,
    }),

    ...(dto.is_online !== undefined && {
      is_online: dto.is_online,
    }),

    ...(dto.meeting_url && {
      meeting_url: dto.meeting_url,
    }),
  },
    });
  }

  async remove(
    userId: string,
    sessionId: string,
  ) {
    const session =
      await this.prisma.study_sessions.findFirst({
        where: {
          id: sessionId,
          user_id: userId,
        },
      });

    if (!session) {
      throw new BadRequestException(
        'Session not found',
      );
    }

    return this.prisma.study_sessions.delete({
      where: {
        id: sessionId,
      },
    });
  }

  async updateUserStreak(
    userId: string,
  ) {
    const user =
      await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      return;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);

    yesterday.setDate(
      yesterday.getDate() - 1,
    );

    let streak =
      user.streak_days || 0;

    let xpBonus = 0;

    if (!user.last_active_date) {
      streak = 1;

      xpBonus = 10;
    } else {
      const lastActive =
        new Date(user.last_active_date);

      lastActive.setHours(0, 0, 0, 0);

      if (
        this.isSameDay(
          lastActive,
          today,
        )
      ) {
        return;
      }

      if (
        this.isSameDay(
          lastActive,
          yesterday,
        )
      ) {
        streak += 1;

        xpBonus = streak * 5;
      } else {
        streak = 1;

        xpBonus = 10;
      }
    }

    await this.prisma.users.update({
      where: {
        id: userId,
      },

      data: {
        streak_days: streak,

        last_active_date: today,

        xp_points: {
          increment: xpBonus,
        },
      },
    });

    if (
      streak > 1 &&
      streak % 7 === 0
    ) {
      await this.prisma.notifications.create({
        data: {
          user_id: userId,

          type: 'weekly_report',

          title: 'Amazing streak 🔥',

          body:
            `You reached ${streak} consecutive study days!`,
        },
      });
    }
  }

  async shareSession(
      userId: string,
      sessionId: string,
      dto: ShareSessionDto,
    ) {
      const session =
        await this.prisma.study_sessions.findFirst({
          where: {
            id: sessionId,
            user_id: userId,
          },
        });

      if (!session) {
        throw new BadRequestException(
          'Session not found',
        );
      }

      const member =
        await this.prisma.group_members.findFirst({
          where: {
            user_id: userId,
            group_id: dto.group_id,
          },
        });

      if (!member) {
        throw new BadRequestException(
          'You are not member of this group',
        );
      }

      await this.prisma.study_sessions.update({
        where: {
          id: sessionId,
        },

        data: {
          session_type: 'group',
        },
      });

      const groupMembers =
        await this.prisma.group_members.findMany({
          where: {
            group_id: dto.group_id,
          },
        });

      for (const groupMember of groupMembers) {
        const existingParticipant =
          await this.prisma.session_participants.findFirst({
            where: {
              session_id: sessionId,
              user_id: groupMember.user_id,
            },
          });

        if (!existingParticipant) {
          await this.prisma.session_participants.create({
            data: {
              session_id: sessionId,

              user_id: groupMember.user_id,

              has_confirmed: false,
            },
          });
        }

        if (groupMember.user_id !== userId) {
          await this.prisma.notifications.create({
            data: {
              user_id: groupMember.user_id,

              type: 'group_session_created',

              title: 'New group session',

              body:
                `You were invited to session ${session.title}`,
            },
          });
        }
      }

      return {
        message:
          'Session shared successfully',
      };
    }

    async confirmParticipation(
      userId: string,
      sessionId: string,
    ) {
      const participant =
        await this.prisma.session_participants.findFirst({
          where: {
            session_id: sessionId,
            user_id: userId,
          },
        });

      if (!participant) {
        throw new BadRequestException(
          'Participant not found',
        );
      }

      return this.prisma.session_participants.update({
        where: {
          id: participant.id,
        },

        data: {
          has_confirmed: true,

          joined_at: new Date(),
        },
      });
    }

    async leaveSession(
      userId: string,
      sessionId: string,
    ) {
      const participant =
        await this.prisma.session_participants.findFirst({
          where: {
            session_id: sessionId,
            user_id: userId,
          },
        });

      if (!participant) {
        throw new BadRequestException(
          'Participant not found',
        );
      }

      return this.prisma.session_participants.update({
        where: {
          id: participant.id,
        },

        data: {
          left_at: new Date(),
        },
      });
    }
}
