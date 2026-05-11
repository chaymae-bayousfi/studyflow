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

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

import { AvailabilitiesService } from './availabilities.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('availabilities')
@UseGuards(JwtAuthGuard)
export class AvailabilitiesController {
  constructor(
    private availabilitiesService: AvailabilitiesService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilitiesService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.availabilitiesService.findAll(
      req.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilitiesService.update(
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
    return this.availabilitiesService.remove(
      req.user.userId,
      id,
    );
  }
}