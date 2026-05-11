import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard')
  dashboard(@Req() req: any) {
    return this.analyticsService.dashboard(
      req.user.userId,
    );
  }
  @Get('weekly')
    weekly(@Req() req: any) {
    return this.analyticsService.weeklyStats(
        req.user.userId,
    );
    }

    @Get('subjects')
    subjects(@Req() req: any) {
    return this.analyticsService.subjectStats(
        req.user.userId,
    );
    }
}