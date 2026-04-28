import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { ValidationPipe } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CreatePostsDto } from './dto/create-posts.dto';

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should accept valid array payload', () => {
    const dto = { posts: [{ postId: '123', text: 'hello', images: ['img1'] }] };
    expect(controller.create(dto)).toEqual({ accepted: true });
  });

  it('should accept multiple posts', () => {
    const dto = {
      posts: [
        { postId: '123', text: 'hello' },
        { postId: '456', text: 'world', images: ['img2'] },
      ],
    };
    expect(controller.create(dto)).toEqual({ accepted: true });
  });

  it('should accept empty posts array', () => {
    const dto = { posts: [] };
    expect(controller.create(dto)).toEqual({ accepted: true });
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
