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

export class ExtractedPostDto {
  @IsString()
  postId: string;

  @IsOptional()
  @IsString()
  author?: string | null;

  @IsOptional()
  @IsString()
  authorProfile?: string | null;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsString()
  publishedAt?: string | null;
}

export class ProcessExtractedPostsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtractedPostDto)
  posts: ExtractedPostDto[];
}
