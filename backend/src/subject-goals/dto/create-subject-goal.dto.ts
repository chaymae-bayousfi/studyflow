import {
  IsDateString,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubjectGoalDto {
  @IsString()
  subject_id: string;

  @IsDateString()
  week_start: string;

  @IsNumber()
  @Min(1)
  target_hours: number;
}