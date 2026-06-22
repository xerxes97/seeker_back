import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepositoryImpl } from './repository/user.repository';
import { PrismaModule } from '../core/db/prisma.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'UserRepository', useClass: UserRepositoryImpl },
  ],
  exports: [UserService],
  imports: [PrismaModule, UserProfileModule],
})
export class UserModule {}
