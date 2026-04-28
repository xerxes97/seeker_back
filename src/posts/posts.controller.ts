import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CreatePostsDto } from './dto/create-posts.dto';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  @Post()
  create(@Body() createPostsDto: CreatePostsDto) {
    createPostsDto.posts.forEach((post) => {
      this.logger.log(`Received post: ${post.postId}`);
    });
    return { accepted: true };
  }
}
