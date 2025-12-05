export interface Experience {
  company: string;
  location: string;
  role: string;
  dates: string;
  summary: string;
  achievements: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
}

export interface Skills {
  languages: string[];
  frameworks_libraries: string[];
  architecture: string[];
  tools_platforms: string[];
  methodologies: string[];
}

export interface KeyProject {
  name: string;
  description: string;
  technologies: string[];
  impact?: string;
}

export interface TailoredResume {
  professional_summary: string;
  highlights_of_qualifications?: string[];
  skills: Skills;
  key_projects?: KeyProject[];
  experience: Experience[];
  education: Education[];
}

export interface ATSBreakdown {
  keywords_match: number;
  skills_match: number;
  experience_relevance: number;
  formatting_score: number;
}

export interface OptimizationNotes {
  ats_score: number;
  ats_breakdown?: ATSBreakdown;
  keywords_incorporated: string[];
  keywords_missing?: string[];
  skills_highlighted: string[];
  experience_reordered: boolean;
  match_score: "High" | "Medium" | "Low";
  suggestions: string;
}

export interface ResumeResponse {
  tailored_resume: TailoredResume;
  optimization_notes: OptimizationNotes;
}

export interface ErrorResponse {
  error: string;
}

export type APIResponse = ResumeResponse | ErrorResponse;

export interface CandidateData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  skills: {
    languages: string;
    frameworks_libraries: string;
    architecture: string;
    css: string;
    tools: string;
    testing: string;
    methodologies: string;
    design: string;
    other: string;
  };
  experience: {
    company: string;
    location: string;
    role: string;
    dates: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
  }[];
  keyProjects?: {
    name: string;
    description: string;
    technologies: string[];
    impact?: string;
  }[];
}

