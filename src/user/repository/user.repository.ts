import { Injectable } from '@nestjs/common';
import { UserRepository } from '../interfaces/repository';
import { ListUserDto } from '../dto/list-user.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Collections } from '../../core/constants/collections.enum';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async create(user: CreateUserDto): Promise<ListUserDto> {
    return await this.firebaseRepository.create(Collections.USERS, user);
  }

  async findById(id: string): Promise<ListUserDto | null> {
    return await this.firebaseRepository.findById<ListUserDto>(
      Collections.USERS,
      id,
    );
  }

  async findByEmail(email: string): Promise<ListUserDto | null> {
    const users = await this.firebaseRepository.findBy<ListUserDto>(
      Collections.USERS,
      [{ field: 'email', op: '==', value: email }],
    );
    return users[0] ?? null;
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto | null> {
    return (await this.firebaseRepository.update(
      Collections.USERS,
      id,
      user,
    )) as unknown as ListUserDto;
  }

  async delete(id: string): Promise<void> {
    await this.firebaseRepository.delete(Collections.USERS, id);
  }
}
