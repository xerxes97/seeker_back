import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ProcessPostsDto } from './dto/process-posts.dto';
import { GetUserId } from '../auth/decorators/get-user.decorator';
import { PostService } from './services/post.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    @Body() createPostsDto: ProcessPostsDto,
    @GetUserId() userId: string,
  ) {
    createPostsDto.posts.forEach((post) => {
      this.logger.log(`Received post: ${post.postId}`);
    });
    const results = await this.postService.processPosts(
      createPostsDto.posts,
      userId,
    );
    return { accepted: true, results };
  }
}
