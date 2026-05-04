// ============================================
// PROFESSION TYPES
// ============================================

export type ProfessionType = "developer" | "payroll" | "grc";

// ============================================
// SKILL STRUCTURES BY PROFESSION
// ============================================

export interface DeveloperSkills {
  languages: string;
  frameworks_libraries: string;
  architecture: string;
  css: string;
  tools: string;
  testing: string;
  methodologies: string;
  design: string;
  other: string;
}

export interface PayrollSkills {
  payroll_systems: string;
  hris_applications: string;
  legislative_knowledge: string;
  software_tools: string;
  methodologies: string;
  certifications: string;
}

export interface GRCSkills {
  frameworks_standards: string;
  grc_platforms: string;
  cloud_security: string;
  audit_compliance: string;
  methodologies: string;
  certifications: string;
}

export type CandidateSkills = DeveloperSkills | PayrollSkills | GRCSkills;

// ============================================
// CANDIDATE DATA TYPES
// ============================================

export interface CandidateExperience {
  company: string;
  location: string;
  role: string;
  dates: string;
  achievements?: string[];
}

export interface CandidateEducation {
  degree: string;
  institution: string;
  location?: string;
}

export interface CandidateKeyProject {
  name: string;
  description: string;
  technologies: string[];
  impact?: string;
}

// Base candidate interface
interface BaseCandidateData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  yearsOfExperience: string;
  professionalTitle: string;
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications?: CandidateEducation[];
  keyProjects?: CandidateKeyProject[];
}

// Developer-specific candidate
export interface DeveloperCandidateData extends BaseCandidateData {
  professionType: "developer";
  skills: DeveloperSkills;
}

// Payroll-specific candidate
export interface PayrollCandidateData extends BaseCandidateData {
  professionType: "payroll";
  skills: PayrollSkills;
}

// GRC-specific candidate
export interface GRCCandidateData extends BaseCandidateData {
  professionType: "grc";
  skills: GRCSkills;
}

// Union type for all candidates
export type CandidateData = DeveloperCandidateData | PayrollCandidateData | GRCCandidateData;

// Legacy type alias for backward compatibility
export type LegacyCandidateData = {
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
};

// ============================================
// TAILORED RESUME TYPES
// ============================================

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

// Flexible skills structure for API response
export interface Skills {
  languages?: string[];
  frameworks_libraries?: string[];
  architecture?: string[];
  tools_platforms?: string[];
  methodologies?: string[];
  // Payroll-specific categories
  payroll_systems?: string[];
  hris_applications?: string[];
  legislative_knowledge?: string[];
  software_tools?: string[];
  certifications?: string[];
  // GRC-specific categories
  frameworks_standards?: string[];
  grc_platforms?: string[];
  cloud_security?: string[];
  audit_compliance?: string[];
}

export interface KeyProject {
  name: string;
  description: string;
  technologies: string[];
  impact?: string;
}

export interface TailoredResume {
  target_job_title?: string;
  professional_summary: string;
  highlights_of_qualifications?: string[];
  skills: Skills;
  key_projects?: KeyProject[];
  experience: Experience[];
  education: Education[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

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

// ============================================
// ATS RESUME BUILDER TYPES (standalone, role-agnostic)
// ============================================

export interface ATSContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
}

export interface ATSResumeTitleRequest {
  jobDescription: string;
  anthropicModel?: string;
  companyName?: string;
  jobTitleFromPosting?: string;
  locationOrWorkModel?: string;
  extraNotes?: string;
  includeCertifications?: boolean;
}

export interface AnthropicModelOption {
  id: string;
  displayName: string;
}

export interface GeneratedJobTitleOption {
  title: string;
  confidence: number;
  rationale: string;
  sourceKeywords: string[];
}

export interface ATSExperienceTitleSuggestion {
  id: string;
  company: string;
  dates: string;
  current_role: string;
  suggested_title: string;
  alternate_titles: string[];
  rationale: string;
}

export interface ATSExperienceTitleOverride {
  id: string;
  title: string;
}

export interface ATSResumeRequest extends ATSResumeTitleRequest {
  targetJobTitle: string;
  experienceTitleOverrides?: ATSExperienceTitleOverride[];
}

export interface ATSResumeTitleResponse {
  recommended_title: string;
  title_options: GeneratedJobTitleOption[];
  experience_title_suggestions: ATSExperienceTitleSuggestion[];
}

// Dynamic, role-agnostic resume shape
export interface DynamicATSSkillGroup {
  label: string;
  items: string[];
}

export interface DynamicATSExperience {
  company: string;
  location?: string;
  role: string;
  dates: string;
  achievements: string[];
}

export interface DynamicATSEducation {
  degree: string;
  institution: string;
  location?: string;
}

export interface DynamicATSExtraSection {
  heading: string;
  bullets: string[];
}

export interface DynamicATSProject {
  name: string;
  technologies: string[];
  bullets: string[];
}

export interface DynamicATSResume {
  target_job_title: string;
  contact: ATSContactInfo;
  professional_summary: string;
  highlights: string[];
  skills: DynamicATSSkillGroup[];
  experience: DynamicATSExperience[];
  education: DynamicATSEducation[];
  professional_designations?: DynamicATSEducation[];
  key_projects?: DynamicATSProject[];
  additional_sections?: DynamicATSExtraSection[];
}

export interface DynamicATSOptimizationNotes {
  ats_score: number;
  keywords_incorporated: string[];
  keywords_missing?: string[];
  match_score: "High" | "Medium" | "Low";
  suggestions: string;
}

export interface DynamicATSResumeResponse {
  dynamic_resume: DynamicATSResume;
  optimization_notes: DynamicATSOptimizationNotes;
}

// ============================================
// HELPER TYPE GUARDS
// ============================================

export const isDeveloperCandidate = (
  candidate: CandidateData
): candidate is DeveloperCandidateData => {
  return candidate.professionType === "developer";
};

export const isPayrollCandidate = (
  candidate: CandidateData
): candidate is PayrollCandidateData => {
  return candidate.professionType === "payroll";
};

export const isGRCCandidate = (
  candidate: CandidateData
): candidate is GRCCandidateData => {
  return candidate.professionType === "grc";
};
