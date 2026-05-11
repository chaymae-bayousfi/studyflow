import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.notificationsService.findAll(
      req.user.userId,
    );
  }

  @Get('unread-count')
  unreadCount(@Req() req: any) {
    return this.notificationsService.unreadCount(
      req.user.userId,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(
      req.user.userId,
      id,
    );
  }
}