import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CreatePostsDto } from './dto/create-posts.dto';
import { PipelineService } from './pipeline/pipeline.service';

@Controller('posts')
export class PostsController {
  private readonly logger = new Logger(PostsController.name);

  constructor(private readonly pipelineService: PipelineService) {}

  @Post()
  async create(@Body() createPostsDto: any) {
    createPostsDto.posts.forEach((post) => {
      this.logger.log(`Received post: ${post.postId}`);
    });
    const results = await this.pipelineService.processPosts(
      createPostsDto.posts,
    );
    return { accepted: true, results };
  }
}
