import { Injectable } from '@nestjs/common';
import { UserRepository } from '../interfaces/repository';
import { ListUserDto } from '../dto/list-user.dto';
import { FirebaseRepository } from '../../core/db/firebase.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Collections } from '../../core/constants/collections.enum';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly firebaseRepository: FirebaseRepository) { }

  async create(user: CreateUserDto): Promise<ListUserDto> {
    return await this.firebaseRepository.create({ collection: Collections.USERS, value: user });
  }

  async findById(id: string): Promise<ListUserDto | null> {
    return await this.firebaseRepository.findById<ListUserDto>(
      Collections.USERS,
      id,
    );
  }

  async findByEmail(email: string): Promise<ListUserDto | null> {
    const users = await this.firebaseRepository.findBy<ListUserDto>(
      [{ field: 'email', op: '==', value: email }],
      1,
      { collection: Collections.USERS },
    );
    return users[0] ?? null;
  }

  async update(id: string, user: UpdateUserDto): Promise<ListUserDto | null> {
    return (await this.firebaseRepository.update(
      user,
      { collection: Collections.USERS, value: id },
    )) as unknown as ListUserDto;
  }

  async delete(id: string): Promise<void> {
    await this.firebaseRepository.delete(
      { collection: Collections.USERS, value: id },
    );
  }
}
