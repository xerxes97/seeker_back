import { Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { OcrService } from '../services/ocr.service';
import { AiService, JobExtractionResult } from '../services/ai.service';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly aiService: AiService,
  ) { }

  async processPost(post: CreatePostDto): Promise<JobExtractionResult | null> {
    try {
      this.logger.log(`Processing post ${post.postId}`);
      let fullText = post.text;

      if (post.images && post.images.length > 0) {
        this.logger.log(`Running OCR for post ${post.postId}`);
        const ocrText = await this.ocrService.processImages(post.images);
        if (ocrText) {
          fullText = `${fullText} ${ocrText}`.trim();
        }
      }

      const result = await this.aiService.processText(post.postId, fullText);
      this.logger.log(`Post ${post.postId} processed successfully`);
      return result ? { ...result, postId: post.postId } : null;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing post ${post.postId}: ${err.message}`,
        err.stack,
      );
      return null;
    }
  }

  async processPosts(
    posts: CreatePostDto[],
  ): Promise<Array<JobExtractionResult | null>> {
    const results: Array<JobExtractionResult | null> = [];
    for (const post of posts) {
      const result = await this.processPost(post);
      results.push(result);
    }
    return results;
  }
}
