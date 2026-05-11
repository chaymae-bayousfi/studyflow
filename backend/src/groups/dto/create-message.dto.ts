import {
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  reply_to_id?: string;
}