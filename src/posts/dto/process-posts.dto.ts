import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PostDto {
  @IsString()
  postId: string;

  @IsString()
  text: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class ProcessPostsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostDto)
  posts: PostDto[];
}
