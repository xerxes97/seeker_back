export class UserProfile {
  user_id: string;
  name?: string;
  lastname?: string;
  skills: string[];
  roles: string[];
  experience_years: number;
  seniority: string;
  location?: string;
  department?: string;
  modality?: string[];
  score_notification?: number;
  updated_at: string;
}
