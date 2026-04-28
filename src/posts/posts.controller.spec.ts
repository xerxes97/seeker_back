import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CreatePostsDto } from './dto/create-posts.dto';
import { PipelineService } from './pipeline/pipeline.service';
import { JobExtractionResult } from './services/ai.service';

describe('PostsController', () => {
  let controller: PostsController;
  let pipelineService: jest.Mocked<PipelineService>;

  const mockResult: JobExtractionResult = {
    is_job: true,
    position: 'Developer',
    company: 'Test Corp',
    location: 'Remote',
    modality: 'remote',
    seniority: 'Senior',
    salary: null,
    technologies: ['TypeScript'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PipelineService,
          useValue: { processPosts: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    pipelineService = module.get(PipelineService);
  });

  it('should accept valid array payload', async () => {
    const dto = { posts: [{ postId: '123', text: 'hello', images: ['img1'] }] };
    pipelineService.processPosts.mockResolvedValue([mockResult]);

    const result = await controller.create(dto);
    expect(result).toEqual({
      accepted: true,
      results: [mockResult],
    });
    expect(pipelineService.processPosts).toHaveBeenCalledWith(dto.posts);
  });

  it('should accept multiple posts', async () => {
    const dto = {
      posts: [
        { postId: '123', text: 'hello' },
        { postId: '456', text: 'world', images: ['img2'] },
      ],
    };
    pipelineService.processPosts.mockResolvedValue([mockResult, mockResult]);

    const result = await controller.create(dto);
    expect(result.results).toHaveLength(2);
  });

  it('should accept empty posts array', async () => {
    const dto = { posts: [] };
    pipelineService.processPosts.mockResolvedValue([]);

    const result = await controller.create(dto);
    expect(result).toEqual({ accepted: true, results: [] });
  });
});

describe('ValidationPipe', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });

  it('should reject missing posts array', async () => {
    const dto = { postId: '123', text: 'hello' };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: CreatePostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid post in array', async () => {
    const dto = { posts: [{ text: 'hello' }] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: CreatePostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject array with invalid post type', async () => {
    const dto = { posts: ['invalid'] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: CreatePostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept valid array payload', async () => {
    const dto = { posts: [{ postId: '123', text: 'hello', images: ['img1'] }] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: CreatePostsDto }),
    ).resolves.toEqual(dto);
  });
});
