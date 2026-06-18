import { IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { CreateUserProfileDto } from './create-user-profile.dto';

export class ListUserProfileDto extends CreateUserProfileDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  // updated_at: string;
  // created_at: string;
  // deleted_at?: string | null;
}
