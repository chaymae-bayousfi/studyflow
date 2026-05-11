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
  Query,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ShareSessionDto } from './dto/share-session.dto';
import { SessionsService } from './sessions.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(
    private sessionsService: SessionsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(
  @Req() req: any,
  @Query('subjectId') subjectId?: string,){
    return this.sessionsService.findAll(
    req.user.userId,
    subjectId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(
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
    return this.sessionsService.remove(
      req.user.userId,
      id,
    );
  }

  @Post(':id/share')
    shareSession(
      @Req() req: any,
      @Param('id') id: string,
      @Body() dto: ShareSessionDto,
    ) {
      return this.sessionsService.shareSession(
        req.user.userId,
        id,
        dto,
      );
    }

    @Post(':id/confirm')
    confirmParticipation(
      @Req() req: any,
      @Param('id') id: string,
    ) {
      return this.sessionsService.confirmParticipation(
        req.user.userId,
        id,
      );
    }

    @Post(':id/leave')
    leaveSession(
      @Req() req: any,
      @Param('id') id: string,
    ) {
      return this.sessionsService.leaveSession(
        req.user.userId,
        id,
      );
    }
}