import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  private readonly publicSelect = {
    id: true,
    email: true,
    first_name: true,
    last_name: true,
    avatar_url: true,
    role: true,
    status: true,
    xp_points: true,
    level: true,
    streak_days: true,
    weekly_goal_hours: true,
    timezone: true,
    email_verified: true,
    created_at: true,
    updated_at: true,
  };

  async create(dto: CreateUserDto) {
    const existingUser =
      await this.prisma.users.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    return this.prisma.users.create({
      data: {
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: passwordHash,
        avatar_url: dto.avatar_url,
        status: (dto.status || 'active') as any,
        xp_points: dto.xp_points || 0,
        level: dto.level || 1,
        streak_days: dto.streak_days || 0,
        weekly_goal_hours:
          dto.weekly_goal_hours || 10,
      },
      select: this.publicSelect,
    });
  }

  async findAll() {
    return this.prisma.users.findMany({
      where: {
        deleted_at: null,
        role: 'user',
      },
      select: this.publicSelect,
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user =
      await this.prisma.users.findFirst({
        where: {
          id,
          deleted_at: null,
        },
        select: this.publicSelect,
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    await this.findOne(id);

    const {
      password,
      status,
      ...profileData
    } = dto;

    const data: any = {
      ...profileData,
      updated_at: new Date(),
    };

    if (status) {
      data.status = status;
    }

    if (password) {
      data.password_hash =
        await bcrypt.hash(password, 10);
    }

    return this.prisma.users.update({
      where: {
        id,
      },
      data,
      select: this.publicSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.users.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        status: 'inactive',
      },
      select: this.publicSelect,
    });
  }

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
