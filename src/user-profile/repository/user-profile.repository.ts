import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { Collections } from '../../core/constants/collections.enum';

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) { }

  async save(
    userId: string,
    profile: CreateUserProfileDto,
  ): Promise<ListUserProfileDto> {
    const profiles = await this.firebaseRepository.findBy<ListUserProfileDto>(
      [{ field: 'user_id', op: '==', value: userId }],
      1,
      { collection: Collections.USER_PROFILES },
    );
    const existing = profiles?.[0];

    if (existing) {
      return await this.firebaseRepository.update(
        profile,
        { collection: Collections.USER_PROFILES, value: existing.id },
      );
    } else {
      return await this.firebaseRepository.create<ListUserProfileDto>(
        { collection: Collections.USERS, value: userId },
        { collection: Collections.USER_PROFILES, value: profile }
      );
    }
  }

  async findByUserId(userId: string): Promise<ListUserProfileDto | null> {
    const profiles = await this.firebaseRepository.findBy<ListUserProfileDto>(
      [{ field: 'user_id', op: '==', value: userId }],
      1,
      { collection: Collections.USERS, value: userId },
      { collection: Collections.USER_PROFILES },
    );
    return profiles?.[0] ?? null;
  }

  async update(
    userId: string,
    profile: UpdateUserProfileDto,
  ): Promise<ListUserProfileDto | null> {
    const [profileFound] = await this.firebaseRepository.findBy<ListUserProfileDto>(
      [{ field: 'user_id', op: '==', value: userId }],
      1,
      { collection: Collections.USERS, value: userId }, { collection: Collections.USER_PROFILES }
    );
    if (profileFound) {
      return (await this.firebaseRepository.update(
        profile,
        { collection: Collections.USERS, value: userId },
        { collection: Collections.USER_PROFILES, value: profileFound.id },
      )) as unknown as ListUserProfileDto;
    }
    return null;
  }

  async delete(userId: string): Promise<void> {
    const profiles = await this.firebaseRepository.findAll<ListUserProfileDto>(Collections.USER_PROFILES);
    const existing = profiles.find((p) => p.user_id === userId);
    if (existing) {
      await this.firebaseRepository.delete(
        { collection: Collections.USER_PROFILES, value: existing.id },
      );
    }
  }
}
