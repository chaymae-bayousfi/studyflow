import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { GenerateScheduleDto } from './dto/generate-schedule.dto';

import { WeeklySchedulesService } from './weekly-schedules.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('weekly-schedules')
@UseGuards(JwtAuthGuard)
export class WeeklySchedulesController {
  constructor(
    private weeklySchedulesService: WeeklySchedulesService,
  ) {}

  @Post('generate')
  generate(
    @Req() req: any,
    @Body() dto: GenerateScheduleDto,
  ) {
    return this.weeklySchedulesService.generate(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.weeklySchedulesService.findAll(
      req.user.userId,
    );
  }
}