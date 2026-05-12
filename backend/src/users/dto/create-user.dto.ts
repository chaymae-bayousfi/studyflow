import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned', 'pending'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  xp_points?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  streak_days?: number;

  @IsOptional()
  weekly_goal_hours?: number;
}
