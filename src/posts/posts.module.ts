import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PipelineService } from './pipeline/pipeline.service';
import { OcrService } from './services/ocr.service';
import { AiService } from './services/ai.service';
import { PostService } from './services/post.service';
import { PostRepositoryImpl } from './repository/post.repository';
import { FirebaseModule } from 'src/core/db/firebase.module';

@Module({
  controllers: [PostsController],
  providers: [PipelineService, OcrService, AiService, PostService, PostRepositoryImpl],
  exports: [PostService],
  imports: [FirebaseModule],
})
export class PostsModule { }
