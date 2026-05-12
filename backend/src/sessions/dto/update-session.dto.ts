import { PartialType } from '@nestjs/mapped-types';

import { CreateSessionDto } from './create-session.dto';

import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateSessionDto extends PartialType(
  CreateSessionDto,
) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  productivity_rating?: number;
}
