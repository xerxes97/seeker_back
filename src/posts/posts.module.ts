import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PipelineService } from './pipeline/pipeline.service';
import { OcrService } from './services/ocr.service';
import { AiService } from './services/ai.service';

@Module({
  controllers: [PostsController],
  providers: [PipelineService, OcrService, AiService],
})
export class PostsModule {}
