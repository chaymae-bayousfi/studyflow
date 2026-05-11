import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateAvailabilityDto,
  ) {
    const start = new Date(
      `1970-01-01T${dto.start_time}`,
    );

    const end = new Date(
      `1970-01-01T${dto.end_time}`,
    );

    if (end <= start) {
      throw new BadRequestException(
        'End time must be after start time',
      );
    }

    return this.prisma.availabilities.create({
      data: {
        user_id: userId,

        day: dto.day as any,

        start_time: start,

        end_time: end,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.availabilities.findMany({
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
    availabilityId: string,
    dto: UpdateAvailabilityDto,
  ) {
    const availability =
      await this.prisma.availabilities.findFirst({
        where: {
          id: availabilityId,
          user_id: userId,
        },
      });

    if (!availability) {
      throw new BadRequestException(
        'Availability not found',
      );
    }

    return this.prisma.availabilities.update({
      where: {
        id: availabilityId,
      },

      data: {
        ...(dto.day && {
          day: dto.day as any,
        }),

        ...(dto.start_time && {
          start_time: new Date(
            `1970-01-01T${dto.start_time}`,
          ),
        }),

        ...(dto.end_time && {
          end_time: new Date(
            `1970-01-01T${dto.end_time}`,
          ),
        }),
      },
    });
  }

  async remove(
    userId: string,
    availabilityId: string,
  ) {
    const availability =
      await this.prisma.availabilities.findFirst({
        where: {
          id: availabilityId,
          user_id: userId,
        },
      });

    if (!availability) {
      throw new BadRequestException(
        'Availability not found',
      );
    }

    return this.prisma.availabilities.delete({
      where: {
        id: availabilityId,
      },
    });
  }
}