import {
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';

import { AnalyticsService } from './analytics.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.analyticsService.dashboard(
      userId || req.user?.userId,
    );
  }
  @Get('weekly')
    weekly(
      @Req() req: any,
      @Query('userId') userId: string,
    ) {
    return this.analyticsService.weeklyStats(
        userId || req.user?.userId,
    );
    }

    @Get('subjects')
    subjects(
      @Req() req: any,
      @Query('userId') userId: string,
    ) {
    return this.analyticsService.subjectStats(
        userId || req.user?.userId,
    );
    }
}
