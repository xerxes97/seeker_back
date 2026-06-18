import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileRepositoryImpl } from './repository/user-profile.repository';
import { CvParserUseCase } from './usecases/cv-parser.use-case';
import { PrismaModule } from '../core/db/prisma.module';

@Module({
  controllers: [UserProfileController],
  providers: [
    UserProfileService,
    CvParserUseCase,
    { provide: 'UserProfileRepository', useClass: UserProfileRepositoryImpl },
  ],
  exports: [UserProfileService],
  imports: [PrismaModule],
})
export class UserProfileModule {}
