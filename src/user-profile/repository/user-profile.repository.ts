import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { Collections } from '../../core/constants/collections.enum';

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>(
      Collections.USER_PROFILES,
    );
    const existing = profiles.find((p) => p.user_id === userId);

    if (existing) {
      return await this.firebaseRepository.update(
        Collections.USER_PROFILES,
        existing.id,
        profile,
      );
    } else {
      return await this.firebaseRepository.create(Collections.USER_PROFILES, {
        ...profile,
        id: userId,
      });
    }
  }

  //TODO: update to support fundBy... query
  async findByUserId(userId: string): Promise<ListUserProfileDto | null> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>(
      Collections.USER_PROFILES,
    );
    return profiles.find((p) => p.user_id === userId) ?? null;
  }

  async update(
    userId: string,
    profile: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>(
      Collections.USER_PROFILES,
    );
    const existing = profiles.find((p) => p.user_id === userId);
    if (existing) {
      return (await this.firebaseRepository.update(
        Collections.USER_PROFILES,
        existing.id,
        profile,
      )) as unknown as ListUserProfileDto;
    }
    return null;
  }

  async delete(userId: string): Promise<void> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>(
      Collections.USER_PROFILES,
    );
    const existing = profiles.find((p) => p.user_id === userId);
    if (existing) {
      await this.firebaseRepository.delete(
        Collections.USER_PROFILES,
        existing.id,
      );
    }
  }
}
