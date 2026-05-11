import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class SessionCommentsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    sessionId: string,
    dto: CreateCommentDto,
  ) {
    const session =
      await this.prisma.study_sessions.findUnique({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      throw new BadRequestException(
        'Session not found',
      );
    }

    const comment =
      await this.prisma.session_comments.create({
        data: {
          session_id: sessionId,

          author_id: userId,

          content: dto.content,
        },
      });

    if (session.user_id !== userId) {
      await this.prisma.notifications.create({
        data: {
          user_id: session.user_id,

          type: 'session_comment',

          title: 'New comment',

          body:
            'Someone commented on your study session',
        },
      });
    }

    return comment;
  }

  async findAll(sessionId: string) {
    return this.prisma.session_comments.findMany({
      where: {
        session_id: sessionId,

        is_deleted: false,
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

  async update(
    userId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ) {
    const comment =
      await this.prisma.session_comments.findFirst({
        where: {
          id: commentId,

          author_id: userId,

          is_deleted: false,
        },
      });

    if (!comment) {
      throw new BadRequestException(
        'Comment not found',
      );
    }

    return this.prisma.session_comments.update({
      where: {
        id: commentId,
      },

      data: {
        content: dto.content,

        edited_at: new Date(),
      },
    });
  }

  async remove(
    userId: string,
    commentId: string,
  ) {
    const comment =
      await this.prisma.session_comments.findFirst({
        where: {
          id: commentId,

          author_id: userId,

          is_deleted: false,
        },
      });

    if (!comment) {
      throw new BadRequestException(
        'Comment not found',
      );
    }

    return this.prisma.session_comments.update({
      where: {
        id: commentId,
      },

      data: {
        is_deleted: true,
      },
    });
  }
}