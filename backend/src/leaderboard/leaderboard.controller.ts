import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { LeaderboardService } from './leaderboard.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(
    private leaderboardService: LeaderboardService,
  ) {}

  @Get('xp')
  topXp() {
    return this.leaderboardService.topUsers();
  }

  @Get('streaks')
  topStreaks() {
    return this.leaderboardService.topStreaks();
  }

  @Get('levels')
  topLevels() {
    return this.leaderboardService.topLevels();
  }
}