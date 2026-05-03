import { Injectable } from '@nestjs/common';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ListUserProfileDto } from './dto/list-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(private readonly repo: UserProfileRepositoryImpl) { }

  async saveProfile(userId: string, dto: CreateUserProfileDto): Promise<ListUserProfileDto> {
    return this.repo.save(userId, dto);
  }

  async getProfile(userId: string): Promise<ListUserProfileDto | null> {
    return this.repo.findByUserId(userId);
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<ListUserProfileDto | null> {
    return await this.repo.update(userId, dto);
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.repo.delete(userId);
  }
}