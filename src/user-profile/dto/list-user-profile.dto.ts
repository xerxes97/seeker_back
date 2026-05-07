import { IsUUID } from 'class-validator';
import { CreateUserProfileDto } from './create-user-profile.dto';

export class ListUserProfileDto extends CreateUserProfileDto {
  @IsUUID()
  id: string;

  // updated_at: string;
  // created_at: string;
  // deleted_at?: string | null;
}
