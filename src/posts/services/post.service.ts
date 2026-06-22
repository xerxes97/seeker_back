import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OcrService } from './AIServices/ocr.service';
import { AiService } from './AIServices/ai.service';
import { PostDto } from '../dto/process-posts.dto';
import { PostRepository } from '../interfaces/repository';
import { ListPostDto } from '../dto/list-post.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { ListUserProfileDto } from 'src/user-profile/dto/list-user-profile.dto';
import { MatchingService } from 'src/matching/matching.service';
import { JobExtractionResult } from '../dto/ia.dto';
import { Modality } from 'src/user-profile/dto/create-user-profile.dto';
import { DEFAULT_SCORE_NOTIFICATION } from '../../core/constants/notification.constants';
import { stripUndefined } from 'src/utils';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly aiService: AiService,
    @Inject('PostRepository') private readonly repo: PostRepository,
    private readonly userProfileService: UserProfileService,
    private readonly matchingService: MatchingService,
    private readonly configService: ConfigService,
  ) {}

  async createPost(dto: CreatePostDto): Promise<ListPostDto> {
    return this.repo.create(dto);
  }

  async getPost(id: string): Promise<ListPostDto | null> {
    return this.repo.findById(id);
  }

  async deletePost(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async processPosts(
    posts: PostDto[],
    userId?: string,
  ): Promise<Array<JobExtractionResult | null>> {
    const results: Array<JobExtractionResult | null> = [];
    let profile: ListUserProfileDto | null = null;
    if (userId) {
      profile = await this.userProfileService.getDefaultProfile(userId);
    }

    const existingPosts = await this.repo.findByExternalIds(
      posts.map((p) => p.postId),
    );
    const existingPostsMap = new Map(
      existingPosts.map((p) => [p.external_id, p]),
    );

    for (const post of posts) {
      const existingPost = existingPostsMap.get(post.postId) ?? null;
      existingPost && console.log('Existing post:', existingPost);
      const result = await this.processPost(post, profile, existingPost);
      results.push(result);
    }
    return results;
  }

  private async processPost(
    post: PostDto,
    profile: ListUserProfileDto | null,
    existingPost: ListPostDto | null,
  ): Promise<JobExtractionResult | null> {
    try {
      this.logger.log(`Processing post ${post.postId}`);

      let result: JobExtractionResult | null = null;

      if (existingPost && existingPost.is_job !== undefined) {
        this.logger.log(
          `Post ${post.postId} already exists, reusing stored data`,
        );
        result = this.mapStoredPostToResult(existingPost);
      } else {
        let fullText = post.text;

        if (post.images && post.images.length > 0) {
          this.logger.log(`Running OCR for post ${post.postId}`);
          const ocrText = await this.ocrService.processImages(post.images);
          if (ocrText) {
            fullText = `${fullText} ${ocrText}`.trim();
          }
        }

        result = await this.aiService.processText(post.postId, fullText);

        if (result) {
          try {
            const createDto = this.mapResultToCreatePostDto(result);
            await this.repo.update(post.postId, createDto);
            this.logger.log(`Post ${post.postId} stored in posts collection`);
          } catch (storeError) {
            this.logger.error(
              `Failed to store post ${post.postId}: ${(storeError as Error).message}`,
              storeError instanceof Error ? storeError.stack : undefined,
            );
          }
        }
      }

      if (!profile || !result) {
        this.logger.log(`Post ${post.postId} processed successfully`);
        return result ? { ...result, postId: post.postId } : null;
      }

      const output: JobExtractionResult = {
        ...result,
        postId: post.postId,
        notify: true,
      };

      const score = this.matchingService.calculateScore(result, profile);
      output.score = score;

      const minScoreNotify =
        this.configService.get<number>('MIN_SCORE_NOTIFY') ?? 15;

      if (score <= minScoreNotify) {
        output.is_job = false;
      }

      if (profile) {
        const threshold =
          profile.scoreNotification ?? DEFAULT_SCORE_NOTIFICATION;
        if (score <= threshold) {
          output.notify = false;
        }
      }

      this.logger.log(`Post ${post.postId} processed successfully`);
      return output;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing post ${post.postId}: ${err.message}`,
        err.stack,
      );
      return null;
    }
  }

  private mapStoredPostToResult(post: ListPostDto): JobExtractionResult {
    return {
      postId: post.external_id ?? post.id,
      is_job: post.is_job,
      position: post.position,
      company: post.company ?? null,
      location: post.location ?? null,
      modality: (post?.modality as Modality) ?? null,
      experience_years: null,
      salary:
        post.salaryMin != null || post.salaryMax != null
          ? {
              min: post.salaryMin ?? null,
              max: post.salaryMax ?? null,
              currency: null,
              period: null,
            }
          : null,
      skills: post.skills ?? [],
      benefits: post.benefits ?? [],
      score: null,
      notify: true,
    };
  }

  private mapResultToCreatePostDto(result: JobExtractionResult): CreatePostDto {
    return stripUndefined({
      is_job: result.is_job ?? false,
      position: result.position ?? '',
      company: result.company ?? '',
      location: result.location ?? null,
      modality: result.modality ?? null,
      seniority: null,
      salaryMin: result.salary?.min ?? null,
      salaryMax: result.salary?.max ?? null,
      skills: result.skills.length > 0 ? result.skills : null,
      benefits: result.benefits.length > 0 ? result.benefits : null,
      created_at: new Date(),
      updated_at: new Date(),
    }) as unknown as CreatePostDto;
  }
}
