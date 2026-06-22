import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { OcrService } from './services/AIServices/ocr.service';
import { AiService } from './services/AIServices/ai.service';
import { PostRepositoryImpl } from './repository/post.repository';
import { FirebaseModule } from 'src/core/db/firebase.module';
import { PostService } from './services/post.service';
import { UserProfileModule } from 'src/user-profile/user-profile.module';
import { MatchingModule } from 'src/matching/matching.module';

@Module({
  controllers: [PostsController],
  providers: [
    OcrService,
    AiService,
    PostService,
    { provide: 'PostRepository', useClass: PostRepositoryImpl },
  ],
  exports: [PostService],
  imports: [FirebaseModule, UserProfileModule, MatchingModule],
})
export class PostsModule {}
