import { IsUUID, IsOptional, IsString } from 'class-validator';
import { CreatePostDto } from '../../posts/dto/create-post.dto';

export class ListPostDto extends CreatePostDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  external_id?: string;
}
