import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';

import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.findAll(
      userId || req.user?.userId,
    );
  }

  @Get('unread-count')
  unreadCount(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.notificationsService.unreadCount(
      userId || req.user?.userId,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(
      userId || req.user?.userId,
      id,
    );
  }
}
