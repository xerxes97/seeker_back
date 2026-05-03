import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { CalculateScoreDto } from './dto/calculate-score.dto';

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchingService],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should return score 0 when no CV skills match', () => {
    const dto: CalculateScoreDto = {
      cv: { skills: ['python', 'java'] },
      job: { skills: ['javascript', 'typescript'] },
    };

    const result = service.calculateScore(dto);
    expect(result.score).toBe(0);
  });

  it('should return high score when most skills match', () => {
    const dto: CalculateScoreDto = {
      cv: { skills: ['javascript', 'typescript', 'nestjs'] },
      job: { skills: ['javascript', 'typescript', 'nodejs'] },
    };

    const result = service.calculateScore(dto);
    expect(result.score).toBe(0.67); // 2 out of 3 match
  });

  it('should return score 1 when all skills match', () => {
    const dto: CalculateScoreDto = {
      cv: { skills: ['javascript', 'typescript'] },
      job: { skills: ['javascript', 'typescript'] },
    };

    const result = service.calculateScore(dto);
    expect(result.score).toBe(1);
  });

  it('should return score 0 when job has no skills', () => {
    const dto: CalculateScoreDto = {
      cv: { skills: ['javascript'] },
      job: { skills: [] },
    };

    const result = service.calculateScore(dto);
    expect(result.score).toBe(0);
  });

  it('should be case insensitive', () => {
    const dto: CalculateScoreDto = {
      cv: { skills: ['JavaScript', 'TypeScript'] },
      job: { skills: ['javascript', 'typescript'] },
    };

    const result = service.calculateScore(dto);
    expect(result.score).toBe(1);
  });
});
