import { IsUUID } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { OmitType } from '@nestjs/swagger';

export class ListUserDto extends OmitType(CreateUserDto, ['password']) {
  @IsUUID()
  id: string;
}
