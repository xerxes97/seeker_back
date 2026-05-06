import { Injectable } from '@nestjs/common';
import { UserRepositoryImpl } from './repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUserDto } from './dto/list-user.dto';
import { UserProfileService } from '../user-profile/user-profile.service';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: UserRepositoryImpl,
    private readonly userProfileService: UserProfileService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<ListUserDto> {
    const user = await this.repo.create(dto);
    await this.userProfileService.saveProfile(user.id, { user_id: user.id });
    return user;
  }

  async getUser(id: string): Promise<ListUserDto | null> {
    return this.repo.findById(id);
  }

  async getUserByEmail(email: string): Promise<ListUserDto | null> {
    return this.repo.findByEmail(email);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
  ): Promise<ListUserDto | null> {
    return await this.repo.update(id, dto);
  }

  async deleteUser(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
