import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
} from '@nestjs/common';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ShareSessionDto } from './dto/share-session.dto';
import { SessionsService } from './sessions.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(
    private sessionsService: SessionsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
  @Req() req: any,
  @Query('userId') userId: string,
  @Query('subjectId') subjectId?: string,){
    return this.sessionsService.findAll(
    userId || req.user?.userId,
    subjectId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(
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
    return this.sessionsService.remove(
      userId || req.user?.userId,
      id,
    );
  }

  @Post(':id/share')
    shareSession(
      @Req() req: any,
      @Query('userId') userId: string,
      @Param('id') id: string,
      @Body() dto: ShareSessionDto,
    ) {
      return this.sessionsService.shareSession(
        userId || req.user?.userId,
        id,
        dto,
      );
    }

    @Post(':id/confirm')
    confirmParticipation(
      @Req() req: any,
      @Query('userId') userId: string,
      @Param('id') id: string,
    ) {
      return this.sessionsService.confirmParticipation(
        userId || req.user?.userId,
        id,
      );
    }

    @Post(':id/leave')
    leaveSession(
      @Req() req: any,
      @Query('userId') userId: string,
      @Param('id') id: string,
    ) {
      return this.sessionsService.leaveSession(
        userId || req.user?.userId,
        id,
      );
    }
}
