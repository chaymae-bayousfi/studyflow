import {
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsEnum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ])
  day: string;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;
}