import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepositoryImpl } from './repository/user.repository';
import { FirebaseModule } from '../core/db/firebase.module';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepositoryImpl],
  exports: [UserService],
  imports: [FirebaseModule, UserProfileModule],
})
export class UserModule {}
