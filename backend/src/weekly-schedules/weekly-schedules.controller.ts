import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { GenerateScheduleDto } from './dto/generate-schedule.dto';

import { WeeklySchedulesService } from './weekly-schedules.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('weekly-schedules')
export class WeeklySchedulesController {
  constructor(
    private weeklySchedulesService: WeeklySchedulesService,
  ) {}

  @Post('generate')
  generate(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: GenerateScheduleDto,
  ) {
    return this.weeklySchedulesService.generate(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.weeklySchedulesService.findAll(
      userId || req.user?.userId,
    );
  }
}
