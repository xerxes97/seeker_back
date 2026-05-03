import { IsArray, IsString, IsNumber } from 'class-validator';

export class MatchSkillsDto {
  @IsArray()
  skills: string[];
}

export class CalculateScoreDto {
  @IsArray()
  cv: MatchSkillsDto;

  @IsArray()
  job: MatchSkillsDto;
}

export class ScoreResponseDto {
  @IsNumber()
  score: number;
}
