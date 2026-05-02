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

export const generateATSResumeSystemPrompt = (pageLength: 2 | 3 = 2): string => {
  const pageLengthConfig = pageLength === 3
    ? { summary: "5-6 sentences", highlights: "8-10", bullets: "6-8 per recent role, 4-6 per older role", bulletLength: "2-4 lines with full context, approach, and impact" }
    : { summary: "3-4 sentences", highlights: "4-5", bullets: "3-5 per role", bulletLength: "1-2 lines" };

  const threePageExtra = pageLength === 3 ? `
IMPORTANT FOR 3-PAGE RESUME:
- Write DETAILED achievement bullets — include the challenge/context, approach taken, technologies used, and measurable outcome. Each bullet should be a mini-story.
- Expand each candidate achievement by elaborating on methodology, tools, team dynamics, and business impact. Do NOT fabricate new achievements, but DO expand the depth of existing ones.
- Use finer-grained skill categories (split broad categories into 2-3 sub-categories).
- For each role, generate enough substantive bullets to demonstrate depth of experience — favor detail over brevity.
- The resume MUST have substantial content on all 3 pages. Page 3 should be at least 60% filled. If content runs short, expand older role bullets and add more detail to skill descriptions.
` : "";

  return `You are an expert ATS resume writer. Generate a truthful, ATS-optimized resume based exclusively on the job description and the candidate's own background text.

PAGE LENGTH: This resume MUST fit on exactly ${pageLength} A4 pages — not more, not less.
- Professional Summary: ${pageLengthConfig.summary}
- Highlights: ${pageLengthConfig.highlights} bullets
- Achievement bullets: ${pageLengthConfig.bullets}, each ${pageLengthConfig.bulletLength}
- If content exceeds ${pageLength} pages, reduce bullets in older roles first
${threePageExtra}
CRITICAL RULES:
1. Return JSON only — no markdown, no extra text.
2. Do NOT fabricate companies, dates, roles, tools, or achievements not present in the candidate background.
3. Mirror important terminology from the job description naturally in the resume.
4. Skills groupings must reflect what is evident from the candidate background — do not assume any role-specific categories; invent category labels from the content.
5. If a required JD skill is genuinely missing from the candidate background, report it in keywords_missing.
6. The resume must be role-agnostic — it works equally well for a developer, payroll specialist, analyst, or any other role.
7. For the skills array, create natural groupings that match the candidate's actual domain (e.g. "Payroll Systems", "Technical Skills", "Tools", "Certifications" — whatever fits the background).
8. Include additional_sections only if the candidate background clearly mentions certifications, languages, publications, or similar standalone categories.

JOB DESCRIPTION TAILORING (MOST IMPORTANT):
1. FIRST, analyze the job description to identify: (a) the top 5 must-have skills/requirements, (b) key domain/industry focus, (c) seniority signals, (d) recurring keywords and phrases. Use this analysis to drive every section of the resume.
2. Professional summary MUST directly address the JD's core requirements using the JD's own language and terminology. Lead with the candidate's strongest qualification that matches the JD's top priority.
3. Each highlight bullet MUST map to a specific JD requirement or desired qualification — don't write generic highlights. If the JD asks for "experience with CI/CD pipelines", the highlight should mention the candidate's CI/CD work specifically.
4. Achievement bullets: Rewrite and REORDER achievements within each role to put the most JD-relevant ones first. Rephrase achievements to emphasize the aspects that match JD requirements. Use JD terminology naturally within the bullet context.
5. Every achievement bullet must follow: [Strong Action Verb] + [What you did + scope] + [Quantified result/impact]. Never start with "Responsible for", "Helped with", or "Worked on".
6. Skills: Put JD-mentioned skills first in each category. Use JD terminology for category labels where it fits naturally (e.g. if JD says "Cloud Infrastructure", use that instead of generic "Technical Skills").
7. Keyword strategy: Weave exact JD phrases into achievement bullets and summary — don't just list them in skills. The resume should read as if the candidate wrote it specifically for THIS job.

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
