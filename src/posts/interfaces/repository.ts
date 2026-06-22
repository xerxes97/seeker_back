import { CreatePostDto } from '../dto/create-post.dto';
import { ListPostDto } from '../dto/list-post.dto';

export interface PostRepository {
  create(post: CreatePostDto): Promise<ListPostDto>;
  findById(id: string): Promise<ListPostDto | null>;
  findByExternalId(externalId: string): Promise<ListPostDto | null>;
  findByExternalIds(ids: string[]): Promise<ListPostDto[]>;
  update(externalId: string, post: CreatePostDto): Promise<ListPostDto>;
  delete(id: string): Promise<void>;
}
