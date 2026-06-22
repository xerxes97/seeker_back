import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsDate,
  IsInt,
  Min,
  Max,
  IsArray,
  IsIn,
  IsNumber,
} from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
const MODALITY_VALUES = ['remote', 'hybrid', 'onsite'] as const;

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  scoreAlert?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experienceYears?: number;

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
  @IsIn(SENIORITY_VALUES)
  seniority?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  scoreNotification?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsDate()
  created_at?: Date;

  @IsOptional()
  @IsDate()
  updated_at?: Date;
}
