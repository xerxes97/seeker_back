import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

export interface UserProfileRepository {
  save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto>;
  findByUserId(userId: string): Promise<ListUserProfileDto[]>;
  findById(profileId: string): Promise<ListUserProfileDto | null>;
  update(
    profileId: string,
    profile: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null>;
  delete(profileId: string): Promise<void>;
  setDefault(userId: string, profileId: string): Promise<void>;
}
