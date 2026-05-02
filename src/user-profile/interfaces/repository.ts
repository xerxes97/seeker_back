import { ListUserProfileDto } from "../dto/list-user-profile.dto";
import { CreateUserProfileDto } from "../dto/create-user-profile.dto";

export interface UserProfileRepository {
  save(userId: string, profile: CreateUserProfileDto): Promise<void>;
  findByUserId(userId: string): Promise<ListUserProfileDto | null>;
  delete(userId: string): Promise<void>;
}