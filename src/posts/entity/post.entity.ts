export class Post {
  id: string;
  is_job: boolean;
  position: string;
  company: string;
  location?: string;
  modality?: string[];
  seniority?: string;
  salary?: number;
  technologies?: string[];
  created_at: string;
  updated_at: string;
}
