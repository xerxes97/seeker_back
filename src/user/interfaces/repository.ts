import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUserDto } from '../dto/list-user.dto';

export interface UserRepository {
  create(user: CreateUserDto): Promise<ListUserDto>;
  findById(id: string): Promise<ListUserDto | null>;
  findByEmail(email: string): Promise<ListUserDto | null>;
  update(id: string, user: UpdateUserDto): Promise<ListUserDto | null>;
  delete(id: string): Promise<void>;
}
