import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  subject_id?: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}