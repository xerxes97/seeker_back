import { ListUserProfileDto } from "../dto/list-user-profile.dto";

export interface UserProfileRepository {
  findById(userId: string): Promise<ListUserProfileDto | null>;
  save(profile: ListUserProfileDto): Promise<ListUserProfileDto>;
}