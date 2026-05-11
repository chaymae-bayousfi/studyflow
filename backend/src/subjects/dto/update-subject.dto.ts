import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum([
    'low',
    'medium',
    'high',
    'critical',
  ])
  priority?: string;
}