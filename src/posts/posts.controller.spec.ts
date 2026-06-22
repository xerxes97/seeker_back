import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ProcessPostsDto } from './dto/process-posts.dto';
import { PostService } from './services/post.service';
import { JobExtractionResult } from './dto/ia.dto';

jest.mock('./services/post.service', () => {
  return {
    PostService: jest.fn().mockImplementation(() => {
      return {
        processPosts: jest.fn(),
      };
    }),
  };
});

describe('PostsController', () => {
  let controller: PostsController;
  let postService: any;

  const mockResult: JobExtractionResult = {
    is_job: true,
    position: 'Developer',
    company: 'Test Corp',
    location: 'Remote',
    modality: 'remote',
    salary: null,
    experience_years: 3,
    skills: ['TypeScript'],
    score: 0.8,
    postId: '123',
    notify: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostService],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postService = module.get(PostService);
  });

  it('should accept valid array payload with userId', async () => {
    const dto: ProcessPostsDto = {
      posts: [{ postId: '123', text: 'hello', images: ['img1'] }],
    };
    postService.processPosts.mockResolvedValue([mockResult]);
    const userId = 'user-123';

    const result = await controller.create(dto, userId);
    expect(result).toEqual({
      accepted: true,
      results: [mockResult],
    });
    expect(postService.processPosts).toHaveBeenCalledWith(dto.posts, userId);
  });

  it('should accept multiple posts with userId', async () => {
    const dto: ProcessPostsDto = {
      posts: [
        { postId: '123', text: 'hello' },
        { postId: '456', text: 'world', images: ['img2'] },
      ],
    };
    postService.processPosts.mockResolvedValue([mockResult, mockResult]);
    const userId = 'user-123';

    const result = await controller.create(dto, userId);
    expect(result.results).toHaveLength(2);
  });

  it('should accept empty posts array with userId', async () => {
    const dto: ProcessPostsDto = { posts: [] };
    postService.processPosts.mockResolvedValue([]);
    const userId = 'user-123';

    const result = await controller.create(dto, userId);
    expect(result).toEqual({ accepted: true, results: [] });
  });
});

describe('ValidationPipe', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });

  it('should reject missing posts array', async () => {
    const dto = { postId: '123', text: 'hello' };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: ProcessPostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid post in array', async () => {
    const dto = { posts: [{ text: 'hello' }] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: ProcessPostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject array with invalid post type', async () => {
    const dto = { posts: ['invalid'] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: ProcessPostsDto }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should accept valid array payload', async () => {
    const dto = { posts: [{ postId: '123', text: 'hello', images: ['img1'] }] };
    await expect(
      pipe.transform(dto, { type: 'body', metatype: ProcessPostsDto }),
    ).resolves.toEqual(dto);
  });
});
