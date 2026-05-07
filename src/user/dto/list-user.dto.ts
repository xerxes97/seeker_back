import { IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class ListUserDto extends CreateUserDto {
  @IsUUID()
  id: string;
}
