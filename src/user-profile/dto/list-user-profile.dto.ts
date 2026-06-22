import {
  IsUUID,
  IsOptional,
  IsInt,
  IsString,
  IsArray,
  IsIn,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { CreateUserProfileDto } from './create-user-profile.dto';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
const MODALITY_VALUES = ['remote', 'hybrid', 'onsite'] as const;

export class ListUserProfileDto extends CreateUserProfileDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsIn(SENIORITY_VALUES)
  seniority?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MODALITY_VALUES, { each: true })
  modality?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsNumber()
  scoreNotification?: number;
}
