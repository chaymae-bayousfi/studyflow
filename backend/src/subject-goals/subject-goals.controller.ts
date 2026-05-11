import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SubjectGoalsService } from './subject-goals.service';

import { CreateSubjectGoalDto } from './dto/create-subject-goal.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('subject-goals')
@UseGuards(JwtAuthGuard)
export class SubjectGoalsController {
  constructor(
    private subjectGoalsService: SubjectGoalsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateSubjectGoalDto,
  ) {
    return this.subjectGoalsService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.subjectGoalsService.findAll(
      req.user.userId,
    );
  }
}