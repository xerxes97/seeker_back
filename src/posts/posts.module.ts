import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { OcrService } from './services/AIServices/ocr.service';
import { AiService } from './services/AIServices/ai.service';
import { PostRepositoryImpl } from './repository/post.repository';
import { PrismaModule } from '../core/db/prisma.module';
import { PostService } from './services/post.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  controllers: [PostsController],
  providers: [
    OcrService,
    AiService,
    PostService,
    { provide: 'PostRepository', useClass: PostRepositoryImpl },
  ],
  exports: [PostService],
  imports: [PrismaModule, UserProfileModule, MatchingModule],
})
export class PostsModule {}
