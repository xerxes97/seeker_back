import { CreatePostDto } from '../dto/create-post.dto';
import { ListPostDto } from '../dto/list-post.dto';

export interface PostRepository {
  create(post: CreatePostDto): Promise<ListPostDto>;
  findById(id: string): Promise<ListPostDto | null>;
  delete(id: string): Promise<void>;
}
