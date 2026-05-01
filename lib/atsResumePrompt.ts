import { ATSResumeRequest, ATSResumeTitleRequest } from "./types";

// ============================================
// JOB TITLE GENERATION (JD-driven only)
// ============================================

export const generateATSJobTitleSystemPrompt = (): string => {
  return `You are an expert recruiter and ATS specialist. Analyze a job posting and suggest ATS-friendly titles derived purely from the job description text.

Rules:
1. Return JSON only — no markdown, no extra text.
2. Derive titles solely from the job description wording, seniority signals, and provided metadata.
3. Generate one recommended title and 3-5 alternates.
4. Titles must be ATS-friendly, concise (2-6 words), and mirror the job description language.
5. Do NOT default to a fixed or pre-defined list — every suggestion must be grounded in the JD.
6. Confidence score is an integer 0-100 based on how strongly the JD signals that title.
7. sourceKeywords must be exact phrases extracted from the job description.
8. Also generate title suggestions for each employment record provided in the candidate experience list.
9. Each employment suggestion must include a JD-aligned title that is realistic for that specific company/date context.
10. Keep company, dates, and current_role exactly as provided.

Return this exact JSON shape:
{
  "recommended_title": "...",
  "title_options": [
    {
      "title": "...",
      "confidence": 90,
      "rationale": "One sentence explaining why this fits the JD.",
      "sourceKeywords": ["keyword1", "keyword2"]
    }
  ],
  "experience_title_suggestions": [
    {
      "id": "exp-0",
      "company": "Company Name",
      "dates": "Date Range",
      "current_role": "Current Resume Role",
      "suggested_title": "JD-aligned role title",
      "alternate_titles": ["Alt 1", "Alt 2", "Alt 3"],
      "rationale": "One sentence why this role title aligns to the JD and this employment entry."
    }
  ]
}`;
};

export const formatATSJobTitleUserMessage = (
  request: ATSResumeTitleRequest,
  experienceRoles: string
): string => {
  return `Analyze this job and suggest resume titles derived from the job description.

<job_description>
${request.jobDescription}
</job_description>

<job_metadata>
Company: ${request.companyName || "Not provided"}
Posted Job Title: ${request.jobTitleFromPosting || "Not provided"}
Location/Work Model: ${request.locationOrWorkModel || "Not provided"}
Extra Notes: ${request.extraNotes || "Not provided"}
</job_metadata>

<candidate_experience_roles>
${experienceRoles}
</candidate_experience_roles>`;
};

// ============================================
// RESUME GENERATION (JD + user experience)
// ============================================

export const generateATSResumeSystemPrompt = (): string => {
  return `You are an expert ATS resume writer. Generate a truthful, ATS-optimized resume based exclusively on the job description and the candidate's own background text.

CRITICAL RULES:
1. Return JSON only — no markdown, no extra text.
2. Do NOT fabricate companies, dates, roles, tools, or achievements not present in the candidate background.
3. Mirror important terminology from the job description naturally in the resume.
4. Skills groupings must reflect what is evident from the candidate background — do not assume any role-specific categories; invent category labels from the content.
5. If a required JD skill is genuinely missing from the candidate background, report it in keywords_missing.
6. The resume must be role-agnostic — it works equally well for a developer, payroll specialist, analyst, or any other role.
7. For the skills array, create natural groupings that match the candidate's actual domain (e.g. "Payroll Systems", "Technical Skills", "Tools", "Certifications" — whatever fits the background).
8. Include additional_sections only if the candidate background clearly mentions certifications, languages, publications, or similar standalone categories.

Return this exact JSON shape:
{
  "dynamic_resume": {
    "target_job_title": "The accepted job title",
    "contact": {
      "name": "From candidate contact info",
      "email": "...",
      "phone": "...",
      "location": "...",
      "linkedin": "..."
    },
    "professional_summary": "3-4 sentences tailored to the target role using JD language and candidate background.",
    "highlights": [
      "Key qualification 1 relevant to the JD",
      "Key qualification 2",
      "Key qualification 3",
      "Key qualification 4",
      "Key qualification 5"
    ],
    "skills": [
      {
        "label": "Category label derived from the background (not hardcoded)",
        "items": ["skill1", "skill2"]
      }
    ],
    "experience": [
      {
        "company": "Company Name",
        "location": "City, Region",
        "role": "Role Title",
        "dates": "Date Range",
        "achievements": [
          "Achievement bullet starting with action verb, including metric where present in background"
        ]
      }
    ],
    "education": [
      {
        "degree": "Degree or Certification",
        "institution": "Institution",
        "location": "Optional"
      }
    ],
    "additional_sections": [
      {
        "heading": "Section heading (e.g. Certifications)",
        "bullets": ["item1", "item2"]
      }
    ]
  },
  "optimization_notes": {
    "ats_score": 95,
    "keywords_incorporated": ["keyword1", "keyword2"],
    "keywords_missing": ["skill the candidate does not have"],
    "match_score": "High",
    "suggestions": "Brief actionable suggestion."
  }
}`;
};

export const formatATSResumeUserMessage = (
  request: ATSResumeRequest,
  candidateProfile: string,
  candidateContactLine: string,
  experienceTitleOverridesText: string
): string => {
  return `Generate an ATS resume using the accepted target title, the job description, and the candidate's background below.

<target_job_title>
${request.targetJobTitle}
</target_job_title>

<candidate_contact>
${candidateContactLine}
</candidate_contact>

<job_description>
${request.jobDescription}
</job_description>

<job_metadata>
Company: ${request.companyName || "Not provided"}
Posted Job Title: ${request.jobTitleFromPosting || "Not provided"}
Location/Work Model: ${request.locationOrWorkModel || "Not provided"}
Extra Notes: ${request.extraNotes || "Not provided"}
</job_metadata>

<experience_title_overrides>
${experienceTitleOverridesText}
</experience_title_overrides>

<candidate_background>
${candidateProfile}
</candidate_background>`;
};
