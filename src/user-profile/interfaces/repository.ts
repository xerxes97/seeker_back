import { ListUserProfileDto } from "../dto/list-user-profile.dto";
import { UpdateUserProfileDto } from "../dto/update-user-profile.dto";
import { CreateUserProfileDto } from "../dto/create-user-profile.dto";

export interface UserProfileRepository {
  save(profile: CreateUserProfileDto): Promise<void>;
  findByUserId(userId: string): Promise<ListUserProfileDto | null>;
  update(userId: string, profile: UpdateUserProfileDto): Promise<void>;
  delete(userId: string): Promise<void>;
}