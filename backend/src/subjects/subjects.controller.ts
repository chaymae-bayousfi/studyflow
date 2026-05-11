import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateSubjectDto } from './dto/create-subject.dto';

import { SubjectsService } from './subjects.service';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(
    private subjectsService: SubjectsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.subjectsService.findAll(
      req.user.userId,
    );
  }
  @Patch(':id')
    update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
    ) {
    return this.subjectsService.update(
        req.user.userId,
        id,
        dto,
    );
    }

    @Delete(':id')
    remove(
    @Req() req: any,
    @Param('id') id: string,
    ) {
    return this.subjectsService.remove(
        req.user.userId,
        id,
    );
    }
}