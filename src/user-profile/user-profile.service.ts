import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from './repository/user-profile.repository';

@Injectable()
export class UserProfileService {
  constructor(private readonly repo: UserProfileRepository) {}

  async createProfile(userId: string, data: any): Promise<any> {
    // Normalization: lowercase skills, remove duplicates, map synonyms
    const normalizedSkills = Array.from(new Set(data.skills.map(s => s.toLowerCase())));
    // For synonyms mapping, e.g., "js" -> "javascript"
    const mappedSkills = normalizedSkills.map(s => (s === 'js' ? 'javascript' : s));
    const profile: any = {
      user_id: data.user_id,
      skills: mappedSkills,
      roles: data.roles ?? [],
      experience_years: data.experience_years,
      seniority: data.seniority,
      updated_at: new Date().toISOString(),
    };
    return this.repo.save(profile);
  }

  async findById(userId: string): Promise<any> {
    return this.repo.findById(userId);
  }
}