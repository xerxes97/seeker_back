import { IsUUID, IsArray, IsString, IsInt, Min, Max, IsIn, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;

export class ListUserProfileDto {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsIn(SENIORITY_VALUES)
  seniority?: string;

  // updated_at: string;
  // created_at: string;
  // deleted_at?: string | null;
}
