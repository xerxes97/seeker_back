import { Injectable } from '@nestjs/common';
import { CalculateScoreDto } from './dto/calculate-score.dto';
import { ScoreResponseDto } from './dto/calculate-score.dto';

@Injectable()
export class MatchingService {
  calculateScore(dto: CalculateScoreDto): ScoreResponseDto {
    const cvSkills = dto.cv.skills.map(s => s.toLowerCase());
    const jobSkills = dto.job.skills.map(s => s.toLowerCase());

    if (jobSkills.length === 0) {
      return { score: 0 };
    }

    const matchingSkills = cvSkills.filter(skill => jobSkills.includes(skill));
    const score = matchingSkills.length / jobSkills.length;

    return { score: parseFloat(score.toFixed(2)) };
  }
}
