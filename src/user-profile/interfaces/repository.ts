import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

export interface UserProfileRepository {
  save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto>;
  findByUserId(userId: string): Promise<ListUserProfileDto | null>;
  delete(userId: string): Promise<void>;
  update(
    userId: string,
    profile: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null>;
}
