import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { SubjectGoalsService } from './subject-goals.service';

import { CreateSubjectGoalDto } from './dto/create-subject-goal.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('subject-goals')
export class SubjectGoalsController {
  constructor(
    private subjectGoalsService: SubjectGoalsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateSubjectGoalDto,
  ) {
    return this.subjectGoalsService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.subjectGoalsService.findAll(
      userId || req.user?.userId,
    );
  }
}
