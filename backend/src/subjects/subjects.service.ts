import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateSubjectDto,
  ) {
    return this.prisma.subjects.create({
      data: {
        user_id: userId,

        name: dto.name,

        description: dto.description,

        color: dto.color || '#4f8ef7',

        icon: dto.icon,

        priority: (dto.priority ||
          'medium') as any,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.subjects.findMany({
      where: {
        user_id: userId,
      },

      orderBy: {
        created_at: 'desc',
      },
    });
  }
  async update(
    userId: string,
    subjectId: string,
    dto: UpdateSubjectDto,
    ) {
    const subject =
        await this.prisma.subjects.findFirst({
        where: {
            id: subjectId,
            user_id: userId,
        },
        });

    if (!subject) {
        throw new Error('Subject not found');
    }

    return this.prisma.subjects.update({
        where: {
        id: subjectId,
        },

        data: {
        ...dto,
        priority: dto.priority as any,
        },
    });
    }

    async remove(
    userId: string,
    subjectId: string,
    ) {
    const subject =
        await this.prisma.subjects.findFirst({
        where: {
            id: subjectId,
            user_id: userId,
        },
        });

    if (!subject) {
        throw new Error('Subject not found');
    }

    return this.prisma.subjects.delete({
        where: {
        id: subjectId,
        },
    });
    }
}