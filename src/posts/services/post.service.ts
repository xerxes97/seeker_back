import { Injectable } from '@nestjs/common';
import { PostRepositoryImpl } from '../repository/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { ListPostDto } from '../dto/list-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly repo: PostRepositoryImpl) {}

  async createPost(dto: CreatePostDto): Promise<ListPostDto> {
    return this.repo.create(dto);
  }

  async getPost(id: string): Promise<ListPostDto | null> {
    return this.repo.findById(id);
  }

  async deletePost(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
