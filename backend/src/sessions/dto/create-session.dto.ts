import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  subject_id?: string;

  @IsDateString()
  planned_start: string;

  @IsDateString()
  planned_end: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority?: string;

  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @IsOptional()
  @IsString()
  meeting_url?: string;
}