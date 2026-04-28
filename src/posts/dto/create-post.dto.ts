import { IsString, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';

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
