export interface MammothResult {
  value: string;
  messages: unknown[];
}

export interface ExperienceEntry {
  position: string;
  company: string;
  dates: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
}

export interface ParsedCvSections {
  __header__?: string;
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  languages?: string;
  certifications?: string;
  projects?: string;
  publications?: string;
}

export interface CvParserOutput {
  personalInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedIn: string | null;
  };
  summary?: string;
  skills?: {
    raw: string;
    parsed: string[];
  };
  experience?: {
    raw: string;
    parsed: ExperienceEntry[];
  };
  education?: {
    raw: string;
    parsed: EducationEntry[];
  };
  languages?: {
    raw: string;
    parsed: string[];
  };
  certifications?: {
    raw: string;
    parsed: string[];
  };
  projects?: string;
  _rawSections?: string[];
}