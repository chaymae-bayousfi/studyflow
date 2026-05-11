import {
  IsUUID,
} from 'class-validator';

export class ShareSessionDto {
  @IsUUID()
  group_id: string;
}