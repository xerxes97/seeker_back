import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';

@Injectable()
export class MockUserProfileRepository implements UserProfileRepository {
  private readonly profiles = new Map<string, ListUserProfileDto>();

  async findById(userId: string): Promise<ListUserProfileDto | null> {
    return this.profiles.get(userId) ?? null;
  }

  async save(profile: ListUserProfileDto): Promise<ListUserProfileDto> {
    this.profiles.set(profile.id, profile);
    return profile;
  }
}