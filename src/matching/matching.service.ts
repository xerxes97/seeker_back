import { Injectable } from '@nestjs/common';
import { ListUserProfileDto } from 'src/user-profile/dto/list-user-profile.dto';
import { IMatch } from './dto/match.sto';
import { ISalary, JobExtractionResult } from 'src/posts/dto/ia.dto';

@Injectable()
export class MatchingService {
  calculateScore(jobDetail: JobExtractionResult, profile: ListUserProfileDto): number {
    const { modality, salary, skills, experience_years, is_job } = jobDetail;
    const { modality: profileModality, salaryMin, salaryMax, experience_years: profileExperienceYears, location: profileLocation, department: profileDepartment } = profile;
    const scoreValues: IMatch = {
      skills: { value: 0, weight: 0.6 },
      experience: { value: 0, weight: 0.2 },
      modality: { value: 0, weight: 0.05 },
      salary: { value: 0, weight: 0.05 },
      location: { value: 0, weight: 0.1 },
    };
    if (!is_job) return 0;
    if (modality && profileModality) {
      const modalityScore = this.calculateModalityScore(modality, profileModality);
      if (modalityScore === 0) return 0;
      scoreValues.modality.value = modalityScore;
    }
    if (salary && salaryMin) {
      scoreValues.salary.value = this.calculateSalaryScore(salary, salaryMin, salaryMax);
    }

    return this.calculateFinalScore(scoreValues);
  }

  private readonly calculateModalityScore = (modality: string, profileModality: string[]): number => {
    if (profileModality?.includes(modality)) {
      return 1;
    }
    return 0;
  }

private readonly calculateSalaryScore = (
  salary: ISalary,
  profileSalaryMin?: number,
  profileSalaryMax?: number,
): number => {
  const { min, max } = salary;

  // no hay info suficiente
  if (!min && !max) {
    return 0.5;
  }

  // salario estimado de la vacante
  const jobSalary =
    min && max
      ? (min + max) / 2
      : min || max!;

  // candidato no especificó salario esperado
  if (!profileSalaryMin && !profileSalaryMax) {
    return 1;
  }

  // salario esperado del candidato
  const expectedSalary =
    profileSalaryMin && profileSalaryMax
      ? (profileSalaryMin + profileSalaryMax) / 2
      : profileSalaryMin || profileSalaryMax!;

  // score proporcional
  const ratio = jobSalary / expectedSalary;

  // limitar entre 0 y 1
  return Math.max(0, Math.min(ratio, 1));
};

  private readonly calculateSkillsScore = (jobSkills: string[], profileSkills: string[]): number => {
    const matchingSkills = profileSkills.filter(skill => jobSkills.includes(skill));
    const score = matchingSkills.length / jobSkills.length;
    return Number.parseFloat(score.toFixed(2));
  }

  private readonly calculateFinalScore = (scoreValues: IMatch): number => {
    const { modality, skills } = scoreValues;
    const finalScore = (modality.value * modality.weight) + (skills.value * skills.weight);
    return Number.parseFloat(finalScore.toFixed(2));
  }
}
