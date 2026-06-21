import {
  IsUUID,
  IsArray,
  IsString,
  IsOptional,
  ArrayMaxSize,
  IsDate,
} from 'class-validator';

const SENIORITY_VALUES = ['junior', 'mid', 'senior'] as const;
export type Seniority = (typeof SENIORITY_VALUES)[number];

const MODALITY_VALUES = ['remote', 'hybrid', 'onsite'] as const;
export type Modality = (typeof MODALITY_VALUES)[number];

export class CreateUserProfileDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'Maximum 5 roles allowed' })
  @IsString({ each: true })
  roles?: string[];

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
