export class User {
  id: string;
  email: string;
  password: string;
  name?: string;
  scoreAlert: number;
  experienceYears?: number;
  location?: string;
  department?: string;
  modality?: string[];
  seniority?: string;
  scoreNotification?: number;
  salaryMin?: number;
  salaryMax?: number;
  created_at: string;
  updated_at: string;
}
