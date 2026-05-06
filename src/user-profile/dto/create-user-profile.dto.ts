import {
  IsUUID,
  IsArray,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsOptional,
  ArrayMaxSize,
  IsDate,
} from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
export type Seniority = (typeof SENIORITY_VALUES)[number];

const MODALITY_VALUES = ['onHouse', 'presential', 'hybrid'] as const;
export type Modality = (typeof MODALITY_VALUES)[number];

export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsArray()
  @IsString({ each: true })
  skills?: string[];

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
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsIn(MODALITY_VALUES, { each: true })
  modality?: Modality[];

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
