import { IsUUID } from 'class-validator';
import { CreatePostDto } from '../../posts/dto/create-post.dto';

export class ListPostDto extends CreatePostDto {
  @IsUUID()
  id: string;
}
