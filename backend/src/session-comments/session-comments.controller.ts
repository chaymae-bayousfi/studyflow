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

import { SessionCommentsService } from './session-comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('session-comments')
@UseGuards(JwtAuthGuard)
export class SessionCommentsController {
  constructor(
    private commentsService: SessionCommentsService,
  ) {}

  @Post(':sessionId')
  create(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      req.user.userId,
      sessionId,
      dto,
    );
  }

  @Get(':sessionId')
  findAll(
    @Param('sessionId') sessionId: string,
  ) {
    return this.commentsService.findAll(
      sessionId,
    );
  }

  @Patch(':commentId')
  update(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(
      req.user.userId,
      commentId,
      dto,
    );
  }

  @Delete(':commentId')
  remove(
    @Req() req: any,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.remove(
      req.user.userId,
      commentId,
    );
  }
}