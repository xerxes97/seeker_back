import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';
import { CvParserUseCase } from './usecases/cv-parser.use-case';
import { FirebaseModule } from 'src/core/db/firebase.module';

@Module({
  controllers: [UserProfileController],
  providers: [
    UserProfileService,
    CvParserUseCase,
    { provide: 'UserProfileRepository', useClass: UserProfileRepositoryImpl },
  ],
  exports: [UserProfileService],
  imports: [FirebaseModule],
})
export class UserProfileModule {}
