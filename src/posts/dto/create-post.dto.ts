import {
  IsBoolean,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
const MODALITY_VALUES = ['onHouse', 'presential', 'hybrid'] as const;

export class CreatePostDto {
  @IsBoolean()
  is_job: boolean;

  @IsString()
  position: string;

  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MODALITY_VALUES, { each: true })
  modality?: string[];

  @IsOptional()
  @IsIn(SENIORITY_VALUES)
  seniority?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}
