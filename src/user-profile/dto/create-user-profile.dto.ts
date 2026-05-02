import { IsUUID, IsArray, IsString, IsInt, Min, Max, IsIn, IsOptional } from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
export type Seniority = (typeof SENIORITY_VALUES)[number];

export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsArray()
  @Min(1, { message: 'At least one skill is required' })
  @Max(20, { message: 'Maximum 20 skills allowed' })
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @Max(5, { message: 'Maximum 5 roles allowed' })
  @IsString({ each: true })
  roles?: string[];

  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsIn(SENIORITY_VALUES)
  seniority?: Seniority;
}
