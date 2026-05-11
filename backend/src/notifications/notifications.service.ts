import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateNotificationDto,
  ) {
    return this.prisma.notifications.create({
      data: {
        user_id: userId,

        type: dto.type as any,

        title: dto.title,

        body: dto.body,

        data: dto.data,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.notifications.findMany({
      where: {
        user_id: userId,
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notifications.count({
      where: {
        user_id: userId,

        is_read: false,
      },
    });
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ) {
    const notification =
      await this.prisma.notifications.findFirst({
        where: {
          id: notificationId,

          user_id: userId,
        },
      });

    if (!notification) {
      throw new BadRequestException(
        'Notification not found',
      );
    }

    return this.prisma.notifications.update({
      where: {
        id: notificationId,
      },

      data: {
        is_read: true,
      },
    });
  }
}