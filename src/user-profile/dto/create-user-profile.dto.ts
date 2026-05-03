import { IsUUID, IsArray, IsString, IsInt, Min, Max, IsIn, IsOptional, ArrayMinSize, ArrayMaxSize, IsDate } from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
export type Seniority = (typeof SENIORITY_VALUES)[number];

export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 roles allowed' })
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsIn(SENIORITY_VALUES)
  seniority?: Seniority;

  @IsOptional()
  @IsDate()
  created_at?: Date;
  
  @IsOptional()
  @IsDate()
  updated_at?: Date;
  
  @IsOptional()
  @IsDate()
  deleted_at?: Date;
}
