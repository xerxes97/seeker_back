import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '../interfaces/repository';
import { ListUserProfileDto } from '../dto/list-user-profile.dto';
import { db } from '../../core/db';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';

@Injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  private readonly collection = db.collection('user_profiles');

  async save(userId: string, profile: CreateUserProfileDto): Promise<void> {
    await this.collection.doc(userId).set(profile, { merge: false });
  }

  async findByUserId(userId: string): Promise<ListUserProfileDto | null> {
    const doc = await this.collection.doc(userId).get();
    return doc.exists ? (doc.data() as ListUserProfileDto) : null;
  }

  async delete(userId: string): Promise<void> {
    await this.collection.doc(userId).delete();
  }
}