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

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

import { AvailabilitiesService } from './availabilities.service';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(
    private availabilitiesService: AvailabilitiesService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Query('userId') userId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilitiesService.create(
      userId || req.user?.userId,
      dto,
    );
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('userId') userId: string,
  ) {
    return this.availabilitiesService.findAll(
      userId || req.user?.userId,
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Query('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.availabilitiesService.update(
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
    return this.availabilitiesService.remove(
      userId || req.user?.userId,
      id,
    );
  }
}
