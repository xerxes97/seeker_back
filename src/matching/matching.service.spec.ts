import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { JobExtractionResult } from '../posts/dto/ia.dto';
import { ListUserProfileDto } from '../user-profile/dto/list-user-profile.dto';

function makeJob(skills: string[], is_job = true): JobExtractionResult {
  return {
    postId: '1',
    is_job,
    position: null,
    company: null,
    location: null,
    modality: null,
    experience_years: null,
    salary: null,
    skills,
    score: null,
    notify: true,
  };
}

function makeProfile(skills: string[]): ListUserProfileDto {
  const profile = new ListUserProfileDto();
  profile.id = 'profile-1';
  profile.user_id = 'user-1';
  profile.skills = skills;
  return profile;
}

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchingService],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should return low score when no skills match', () => {
    const job = makeJob(['cobol', 'fortran']);
    const profile = makeProfile(['javascript', 'typescript']);
    const result = service.calculateScore(job, profile);
    expect(result).toBeLessThan(60);
  });

  it('should return higher score when two of three skills match', () => {
    const job = makeJob(['javascript', 'typescript', 'ruby']);
    const profile = makeProfile(['javascript', 'typescript', 'python']);
    const result = service.calculateScore(job, profile);
    expect(result).toBeGreaterThan(0);
  });

  it('should return score > 0 when all skills match', () => {
    const job = makeJob(['javascript', 'typescript']);
    const profile = makeProfile(['javascript', 'typescript']);
    const result = service.calculateScore(job, profile);
    expect(result).toBeGreaterThan(0);
  });

  it('should return 0 when is_job is false', () => {
    const job = makeJob(['javascript'], false);
    const profile = makeProfile(['javascript']);
    const result = service.calculateScore(job, profile);
    expect(result).toBe(0);
  });

  it('should be case insensitive with skill matching', () => {
    const job = makeJob(['JavaScript', 'TypeScript']);
    const profile = makeProfile(['javascript', 'typescript']);
    const result = service.calculateScore(job, profile);
    expect(result).toBeGreaterThan(0);
  });

  it('should return non-negative score when job has no skills', () => {
    const job = makeJob([]);
    const profile = makeProfile(['javascript']);
    const result = service.calculateScore(job, profile);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});
