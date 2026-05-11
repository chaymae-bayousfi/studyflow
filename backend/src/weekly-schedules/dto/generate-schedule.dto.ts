import { IsDateString } from 'class-validator';

export class GenerateScheduleDto {
  @IsDateString()
  week_start: string;
}