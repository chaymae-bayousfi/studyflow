import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Param,
  Query,
} from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';

import { GroupsService } from './groups.service';

import { CreateMessageDto } from './dto/create-message.dto';

import { InviteUserDto } from './dto/invite-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(
    private groupsService: GroupsService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateGroupDto,
  ) {
    return this.groupsService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Post(':id/join')
    join(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    ) {
    return this.groupsService.joinGroup(
        userId || req.user?.userId,
        id,
    );
    }

    @Get(':id/members')
    members(@Param('id') id: string) {
    return this.groupsService.getMembers(
        id,
    );
    }

    @Post(':id/messages')
    sendMessage(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
    ) {
    return this.groupsService.sendMessage(
        userId || req.user?.userId,
        id,
        dto,
    );
    }

    @Get(':id/messages')
    messages(@Param('id') id: string) {
    return this.groupsService.getMessages(
        id,
    );
    }

    @Post('join/code')
    joinByCode(
      @Req() req: any,
      @Query('userId') userId: string,
      @Query('code') code: string,
    ) {
      return this.groupsService.joinByCode(
        userId || req.user?.userId,
        code,
      );
    }

    @Post(':id/invite')
    inviteUser(
      @Req() req: any,
      @Query('userId') userId: string,
      @Param('id') id: string,
      @Body() dto: InviteUserDto,
    ) {
      return this.groupsService.inviteUser(
        userId || req.user?.userId,
        id,
        dto,
      );
    }
}
