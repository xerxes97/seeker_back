import { IsArray, ValidateNested, IsString, IsOptional, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  postId: string;

  @IsString()
  text: string;

  @IsArray()
  @IsOptional()
  @ArrayNotEmpty()
  images?: string[];
}

export class ProcessPostsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePostDto)
  posts: CreatePostDto[];
}
