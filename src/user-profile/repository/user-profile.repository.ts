import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async save(userId: string, profile: CreateUserProfileDto): Promise<ListUserProfileDto> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>('user_profiles');
    const existing = profiles.find(p => p.user_id === userId);
    
    if (existing) {
      return await this.firebaseRepository.update('user_profiles', existing.id, profile);
    } else {
      return await this.firebaseRepository.create('user_profiles', { ...profile, id: userId });
    }
  }

  async findByUserId(userId: string): Promise<ListUserProfileDto | null> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>('user_profiles');
    return profiles.find(p => p.user_id === userId) ?? null;
  }

  async update(userId: string, profile: UpdateUserProfileDto): Promise<ListUserProfileDto | null> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>('user_profiles');
    const existing = profiles.find(p => p.user_id === userId);
    if (existing) {
      return await this.firebaseRepository.update('user_profiles', existing.id, profile) as unknown as ListUserProfileDto;
    }
    return null;
  }

  async delete(userId: string): Promise<void> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>('user_profiles');
    const existing = profiles.find(p => p.user_id === userId);
    if (existing) {
      await this.firebaseRepository.delete('user_profiles', existing.id);
    }
  }
}
