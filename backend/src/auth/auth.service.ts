import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  private generateRefreshToken() {
    return (
      Math.random().toString(36) +
      Date.now().toString(36)
    );
  }
  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      first_name,
      last_name,
    } = registerDto;

    const existingUser =
      await this.prisma.users.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await this.prisma.users.create({
      data: {
        email,
        first_name,
        last_name,
        password_hash: hashedPassword,
      },
    });
    const refreshToken =
      this.generateRefreshToken();

    const hashedRefreshToken =
      await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7,
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,

        token_hash: hashedRefreshToken,

        expires_at: expiresAt,
      },
    });
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'User created successfully',
      access_token: token,
      refresh_token: refreshToken,
      user,
    };
  }
  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
        where: {
        email,
        },
    });

    if (!user) {
        throw new BadRequestException(
        'Invalid credentials',
        );
    }

    const passwordMatches =
        await bcrypt.compare(
        password,
        user.password_hash,
        );

    if (!passwordMatches) {
        throw new BadRequestException(
        'Invalid credentials',
        );
    }

    const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
    });
    const refreshToken =
      this.generateRefreshToken();

    const hashedRefreshToken =
      await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7,
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: user.id,

        token_hash: hashedRefreshToken,

        expires_at: expiresAt,
      },
    });
    return {
        access_token: token,
        refresh_token: refreshToken,
        user,
    };
    }

    async refresh(
      refreshToken: string,
    ) {
      const tokens =
        await this.prisma.refresh_tokens.findMany({
          where: {
            revoked: false,
          },

          include: {
            users: true,
          },
        });

      let matchedToken: any = null;

      for (const token of tokens) {
        const matches =
          await bcrypt.compare(
            refreshToken,
            token.token_hash,
          );

        if (matches) {
          matchedToken = token;
          break;
        }
      }

      if (!matchedToken) {
        throw new BadRequestException(
          'Invalid refresh token',
        );
      }

      if (
        matchedToken.expires_at <
        new Date()
      ) {
        throw new BadRequestException(
          'Refresh token expired',
        );
      }

      const accessToken =
        this.jwtService.sign({
          sub: matchedToken.users.id,

          email:
            matchedToken.users.email,

          role:
            matchedToken.users.role,
        });

      return {
        access_token: accessToken,
      };
    }

    async logout(
      refreshToken: string,
    ) {
      const tokens =
        await this.prisma.refresh_tokens.findMany({
          where: {
            revoked: false,
          },
        });

      for (const token of tokens) {
        const matches =
          await bcrypt.compare(
            refreshToken,
            token.token_hash,
          );

        if (matches) {
          await this.prisma.refresh_tokens.update({
            where: {
              id: token.id,
            },

            data: {
              revoked: true,
            },
          });

          return {
            message:
              'Logged out successfully',
          };
        }
      }

      throw new BadRequestException(
        'Invalid refresh token',
      );
    }
}