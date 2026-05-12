import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { CreateSubjectDto } from './dto/create-subject.dto';

import { SubjectsService } from './subjects.service';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()

@Controller('subjects')
export class SubjectsController {
  constructor(
    private subjectsService: SubjectsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.subjectsService.findAll(
      userId || req.user?.userId,
    );
  }
  @Patch(':id')
    update(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
    ) {
    return this.subjectsService.update(
        userId || req.user?.userId,
        id,
        dto,
    );
    }

    @Delete(':id')
    remove(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    ) {
    return this.subjectsService.remove(
        userId || req.user?.userId,
        id,
    );
    }
}
