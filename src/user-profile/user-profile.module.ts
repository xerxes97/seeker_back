import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';

@Module({
  controllers: [UserProfileController],
  providers: [UserProfileService, UserProfileRepositoryImpl],
  exports: [UserProfileService],
})
export class UserProfileModule {}
