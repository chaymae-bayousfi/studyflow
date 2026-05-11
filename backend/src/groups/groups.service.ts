import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateGroupDto } from './dto/create-group.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private generateInviteCode() {
    return Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
  }
  async create(
    userId: string,
    dto: CreateGroupDto,
  ) {
    const group =
      await this.prisma.study_groups.create({
        data: {
          created_by: userId,

          name: dto.name,

          description: dto.description,

          subject_id: dto.subject_id,

          is_public: dto.is_public || false,

          invitation_code:
            this.generateInviteCode(),
        },
      });

    await this.prisma.group_members.create({
      data: {
        group_id: group.id,

        user_id: userId,

        role: 'owner',
      },
    });

    return group;
  }

  async findAll() {
    return this.prisma.study_groups.findMany({
      include: {
        subjects: true,
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }
  async joinGroup(
    userId: string,
    groupId: string,
    ) {
    const group =
        await this.prisma.study_groups.findUnique({
        where: {
            id: groupId,
        },
        });

    if (!group) {
        throw new BadRequestException(
        'Group not found',
        );
    }
    if (!group.is_public) {
      throw new BadRequestException(
        'Private group',
      );
    }
    const existingMember =
        await this.prisma.group_members.findFirst({
        where: {
            group_id: groupId,
            user_id: userId,
        },
        });

    if (existingMember) {
        throw new BadRequestException(
        'Already member of this group',
        );
    }

    return this.prisma.group_members.create({
        data: {
        group_id: groupId,

        user_id: userId,

        role: 'member',
        },
    });
    }
    async getMembers(groupId: string) {
    return this.prisma.group_members.findMany({
        where: {
        group_id: groupId,
        },

        include: {
        users_group_members_user_idTousers: {
            select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            },
        },
        },
    });
    }
    async sendMessage(
        userId: string,
        groupId: string,
        dto: CreateMessageDto,
        ) {
        const member =
            await this.prisma.group_members.findFirst({
            where: {
                group_id: groupId,
                user_id: userId,
            },
            });

        if (!member) {
            throw new BadRequestException(
            'You are not member of this group',
            );
        }

        return this.prisma.group_messages.create({
            data: {
            group_id: groupId,

            sender_id: userId,

            content: dto.content,

            reply_to_id: dto.reply_to_id,
            },
        });
    }

    async getMessages(groupId: string) {
        return this.prisma.group_messages.findMany({
            where: {
            group_id: groupId,
            },

            include: {
            users: {
                select: {
                id: true,
                first_name: true,
                last_name: true,
                },
            },
            },

            orderBy: {
            created_at: 'asc',
            },
        });
    }

    async joinByCode(
    userId: string,
    code: string,
  ) {
    const group =
      await this.prisma.study_groups.findFirst({
        where: {
          invitation_code: code,
        },

        include: {
          group_members: true,
        },
      });

    if (!group) {
      throw new BadRequestException(
        'Invalid invitation code',
      );
    }

    if (
      group.group_members.length >=
      group.max_members
    ) {
      throw new BadRequestException(
        'Group is full',
      );
    }

    const existingMember =
      await this.prisma.group_members.findFirst({
        where: {
          user_id: userId,
          group_id: group.id,
        },
      });

    if (existingMember) {
      throw new BadRequestException(
        'Already member',
      );
    }

    return this.prisma.group_members.create({
      data: {
        user_id: userId,

        group_id: group.id,

        role: 'member',
      },
    });
  }

  async inviteUser(
      userId: string,
      groupId: string,
      dto: InviteUserDto,
    ) {
      const member =
        await this.prisma.group_members.findFirst({
          where: {
            user_id: userId,
            group_id: groupId,
          },
        });

      if (!member) {
        throw new BadRequestException(
          'You are not member of this group',
        );
      }

      if (
        member.role !== 'owner' &&
        member.role !== 'moderator'
      ) {
        throw new BadRequestException(
          'No permission',
        );
      }

      const user =
        await this.prisma.users.findUnique({
          where: {
            email: dto.email,
          },
        });

      if (!user) {
        throw new BadRequestException(
          'User not found',
        );
      }

      const existingMember =
        await this.prisma.group_members.findFirst({
          where: {
            user_id: user.id,
            group_id: groupId,
          },
        });

      if (existingMember) {
        throw new BadRequestException(
          'User already member',
        );
      }

      const group =
        await this.prisma.study_groups.findUnique({
          where: {
            id: groupId,
          },
        });

      if (!group) {
        throw new BadRequestException(
          'Group not found',
        );
      }

      const createdMember =
        await this.prisma.group_members.create({
          data: {
            user_id: user.id,

            group_id: groupId,

            role: 'member',

            invited_by: userId,
          },
        });

      await this.prisma.notifications.create({
        data: {
          user_id: user.id,

          type: 'group_invitation',

          title: 'Group invitation',

          body:
            `You were added to ${group.name}`,
        },
      });

      return createdMember;
    }
}