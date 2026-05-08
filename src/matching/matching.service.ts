import { Injectable } from '@nestjs/common';
import { ListUserProfileDto } from 'src/user-profile/dto/list-user-profile.dto';
import { IMatch } from './dto/match.sto';
import { ISalary, JobExtractionResult } from 'src/posts/dto/ia.dto';
import Fuse from 'fuse.js';

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
      location: { value: 0.1, weight: 0.1 },
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
    if (experience_years && profileExperienceYears) {
      scoreValues.experience.value = this.calculateExperienceScore(experience_years, profileExperienceYears);
    }
    if (skills && profile.skills) {
      scoreValues.skills.value = this.calculateSkillsScore(skills, profile.skills);
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

  private readonly calculateExperienceScore = (
    requiredYears?: number,
    candidateYears?: number,
  ): number => {

    // sin información
    if (!requiredYears || !candidateYears) {
      return 0.5;
    }

    // cumple o supera
    if (candidateYears >= requiredYears) {
      return 1;
    }

    // proporcional
    return Math.max(
      0,
      Math.min(candidateYears / requiredYears, 1),
    );
  };

  private readonly calculateFinalScore = (scoreValues: IMatch): number => {
    const finalScore = Object.values(scoreValues)
      .reduce((acc, item) => {
        return acc + (item.value * item.weight);
      }, 0);

    return Math.round(finalScore * 100);
  }

  private readonly calculateSkillsScore = (
    requiredSkills: string[],
    candidateSkills: string[],
  ): number => {

    if (!requiredSkills.length) {
      return 1;
    }

    let matches = 0;

    for (const requiredSkill of requiredSkills) {

      const found = candidateSkills.some(
        candidateSkill =>
          this.skillMatches(
            candidateSkill,
            requiredSkill,
          ),
      );

      if (found) {
        matches++;
      }
    }

    return matches / requiredSkills.length;
  };

  private readonly skillMatches = (
    candidateSkill: string,
    requiredSkill: string,
  ): boolean => {

    const normalizedCandidate =
      this.normalizeSkill(candidateSkill);

    const normalizedRequired =
      this.normalizeSkill(requiredSkill);

    // exacto
    if (normalizedCandidate === normalizedRequired) {
      return true;
    }

    const fuse = new Fuse(
      [normalizedRequired],
      {
        includeScore: true,
        threshold: 0.3,
      },
    );

    const result = fuse.search(
      normalizedCandidate,
    );

    if (!result.length) {
      return false;
    }

    return (result[0].score || 1) <= 0.3;
  };

  private readonly normalizeSkill = (
    skill: string,
  ): string => {

    const normalized = skill
      .toLowerCase()
      .trim()
      .replaceAll(/\s+/g, '')
      .replaceAll('.', '');

    const aliases: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      node: 'nodejs',
      nodejs: 'nodejs',
      reactjs: 'react',
      nextjs: 'next',
    };

    return aliases[normalized] || normalized;
  };
}
