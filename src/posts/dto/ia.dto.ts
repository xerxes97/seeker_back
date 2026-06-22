import { Modality } from 'src/user-profile/dto/create-user-profile.dto';

export interface ISalary {
  min: number | null;
  max: number | null;
  currency: string | null;
  period: string | null;
}

export interface Contact {
  email: string | null;
  phone: string | null;
  link: string | null;
}

export interface JobExtractionResult {
  postId: string;
  is_job: boolean | null;
  position: string | null;
  company: string | null;
  location: string | null;
  modality: Modality | null;
  experience_years: number | null;
  salary: ISalary | null;
  skills: string[];
  benefits: string[];
  contact?: Contact | null;
  score: number | null;
  notify: boolean;
}
