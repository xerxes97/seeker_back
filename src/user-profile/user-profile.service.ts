import { Injectable } from '@nestjs/common';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly repo: UserProfileRepositoryImpl) {}

  async saveProfile(userId: string, dto: CreateUserProfileDto): Promise<ListUserProfileDto> {
    const existing = await this.repo.findByUserId(userId);
    const now = new Date();
    const profile: CreateUserProfileDto = {
      ...dto,
      updated_at: now,
      created_at: existing?.created_at ?? now,
    };
    await this.repo.save(userId, profile);
    return {id: userId, ...profile};
  }

  async getProfile(userId: string): Promise<ListUserProfileDto | null> {
    return this.repo.findByUserId(userId);
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<ListUserProfileDto> {
    const { user_id, ...profileData } = dto;
    const existing = await this.repo.findByUserId(userId);
    if (!existing) {
      throw new Error('Profile not found');
    }
    const now = new Date();
    const updated: ListUserProfileDto = {
      id: userId,
      user_id: userId,
      ...profileData,
      updated_at: now,
      created_at: existing.created_at,
    };
    await this.repo.save(userId, updated);
    return updated;
  }

  async deleteProfile(userId: string): Promise<void> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      existing.deleted_at = new Date();
      await this.repo.save(userId, existing);
    }
  }
}