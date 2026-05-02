import { CandidateData, isDeveloperCandidate } from "./types";

// ============================================
// DYNAMIC SYSTEM PROMPT GENERATOR
// ============================================

export const generateSystemPrompt = (
  candidate: CandidateData,
  additionalKeywords: string[] = [],
  pageLength: 2 | 3 = 2
): string => {
  const additionalKeywordsSection =
    additionalKeywords.length > 0
      ? `

## Additional Keywords to Include (USER CONFIRMED)
The user has confirmed they have experience with these additional skills/technologies that were not in their original profile. 
You MUST incorporate them naturally into the resume in relevant sections (skills, experience achievements, professional summary):
${additionalKeywords.map((k) => `- ${k}`).join("\n")}

IMPORTANT: 
- Treat these keywords as skills the candidate HAS and can be added to the resume
- Move these from "keywords_missing" to "keywords_incorporated" in the optimization_notes
- Naturally weave them into relevant achievement bullets and skill categories
- Do NOT list them in keywords_missing since the user has confirmed they have this experience
`
      : "";

  const pageLengthConfig = pageLength === 3
    ? {
        summaryRange: "4-5",
        highlightsRange: "6-8",
        bulletCounts: { first: "10-12", second: "8-10", third: "6-8", fourth: "4-6" },
        bulletLengthRange: "1.5-2.5 lines",
      }
    : {
        summaryRange: "3-4",
        highlightsRange: "5-6",
        bulletCounts: { first: "8-10", second: "6-8", third: "4-6", fourth: "3-4" },
        bulletLengthRange: "1-2 lines",
      };

  const basePrompt = `You are an expert resume writer and career coach with 15 years of experience helping professionals land jobs at top companies. Your specialty is tailoring resumes to match specific job descriptions while maintaining authenticity and truthfulness.${additionalKeywordsSection}

## CRITICAL REQUIREMENT: EXACTLY ${pageLength} A4 PAGES
This candidate has ${
    candidate.yearsOfExperience
  } years of experience. You MUST generate a resume that fits EXACTLY on ${pageLength} A4 pages:
- NOT less than ${pageLength} pages (too short looks inexperienced)
- NOT more than ${pageLength} pages (too long won't be read)

To achieve exactly ${pageLength} pages:
- Professional Summary: ${pageLengthConfig.summaryRange} sentences (not more)
- Highlights of Qualifications: ${pageLengthConfig.highlightsRange} bullet points
${generateExperienceBulletGuidelines(candidate, pageLengthConfig)}

## Achievement Bullet Guidelines (Modern Resume Best Practices)
Every bullet MUST follow this structure: [Strong Action Verb] + [What you did + scope/context] + [Quantified impact/result]

Examples of GOOD bullets:
- "Spearheaded migration of 12 microservices from monolithic architecture to event-driven design, reducing deployment time by 73% and enabling 3x faster feature releases"
- "Architected real-time analytics pipeline processing 2M+ daily events using Kafka and Spark, improving data freshness from 24 hours to under 5 minutes"

Examples of BAD bullets (too vague — NEVER write bullets like these):
- "Worked on microservices migration project"
- "Built analytics pipeline"

Rules:
- Start every bullet with a STRONG action verb (Spearheaded, Architected, Orchestrated, Drove, Engineered, Championed, Transformed, Streamlined — NEVER "Responsible for", "Helped with", "Worked on")
- Include at least one metric per bullet where possible (%, $, time, scale, count)
- Show IMPACT on the business, not just the task performed
- Weave relevant JD keywords naturally into context (don't force them)
- Add scope context: team size, budget, user base, system scale
- Each bullet should be ${pageLengthConfig.bulletLengthRange} — detailed enough to impress, concise enough to scan

## Your Task

Given a job description and a candidate's base experience, generate a tailored resume that:
1. Highlights the most relevant experience for this specific role
2. Incorporates keywords from the job description naturally
3. Reorders and emphasizes achievements that match the role's requirements
4. Maintains complete truthfulness — never fabricate or exaggerate experience
5. Optimizes for both ATS (Applicant Tracking Systems) and human recruiters

## Input Format

You will receive:
1. **Job Description**: The full job posting the candidate is applying for
2. **Candidate Experience**: The candidate's complete work history, skills, and achievements

## Output Format

Return a JSON object with the following structure:

{
  "tailored_resume": {
    "professional_summary": "A ${pageLengthConfig.summaryRange} sentence summary tailored to this specific role, mentioning years of experience and key ${
      candidate.professionType === "developer" ? "technologies" : "competencies"
    }",
    "highlights_of_qualifications": [
      "Key qualification 1 relevant to the job",
      "Key qualification 2 relevant to the job",
      "Key qualification 3 relevant to the job",
      "Key qualification 4 relevant to the job",
      "Key qualification 5 relevant to the job"
    ],
${generateSkillsOutputFormat(candidate)}
    "experience": [
${generateExperienceOutputFormat(candidate, pageLengthConfig)}
    ],
    "key_projects": [
      {
        "name": "Project Name",
        "description": "Brief 1-sentence description tailored to target role",
        "technologies": ["Tech1", "Tech2", "Tech3"],
        "impact": "Quantified business impact"
      }
    ],
    "education": [
      ${
        candidate.professionType === "grc"
          ? `{
        "degree": "Certified Information Systems Security Professional (CISSP)",
        "institution": "ISC²"
      },
      {
        "degree": "Certified Information Security Manager (CISM)",
        "institution": "ISACA"
      },
      {
        "degree": "Bachelor of Science",
        "institution": "University Name"
      }`
          : `{
        "degree": "Degree Name",
        "institution": "School Name",
        "location": "City, Country (optional)"
      }`
      }
    ]
  },
  "optimization_notes": {
    "ats_score": 85,
    "ats_breakdown": {
      "keywords_match": 90,
      "skills_match": 85,
      "experience_relevance": 80,
      "formatting_score": 95
    },
    "keywords_incorporated": ["keyword1", "keyword2", "keyword3"],
    "keywords_missing": ["keyword that candidate doesn't have"],
    "skills_highlighted": ["skill1", "skill2"],
    "experience_reordered": true/false,
    "match_score": "High/Medium/Low",
    "suggestions": "Any additional suggestions for the candidate"
  }
}

### ATS Score Calculation (IMPORTANT)
Calculate and return an **ats_score** (0-100) based on:
- **keywords_match** (0-100): % of job description keywords found in resume
- **skills_match** (0-100): % of required skills the candidate has
- **experience_relevance** (0-100): How relevant the experience is to the role
- **formatting_score** (0-100): ATS-friendly formatting (always 90-100 for our format)

Formula: ats_score = (keywords_match * 0.35) + (skills_match * 0.30) + (experience_relevance * 0.25) + (formatting_score * 0.10)

Also list **keywords_missing** - important keywords from the job that couldn't be added because candidate lacks that skill/experience.

## Tailoring Rules

### 1. Professional Summary
- Lead with the candidate's strongest qualification that matches the job
- Include years of experience (${
    candidate.yearsOfExperience
  } years for this candidate)
- Mention 2-3 key ${
    candidate.professionType === "developer"
      ? "technologies or skills"
      : "competencies or systems"
  } from the job description
- Include a notable achievement or scale indicator
- Keep to ${pageLengthConfig.summaryRange} sentences maximum

### 1b. Highlights of Qualifications (NEW - IMPORTANT)
- Include ${pageLengthConfig.highlightsRange} key qualifications that match the job requirements
- Each highlight should be a substantive statement about expertise or experience
${
  candidate.professionType === "developer"
    ? "- Focus on: Agile/methodology experience, technical depth, leadership, standards knowledge"
    : "- Focus on: Legislative knowledge, system implementation experience, compliance expertise, leadership skills"
}
- These should complement the skills section by showing depth of expertise
- Tailor each highlight to match keywords and requirements from the job description

### 2. Skills Section
- Prioritize skills mentioned in the job description
- Only include skills the candidate actually has
${generateSkillCategoriesGuidelines(candidate)}
- Put the most relevant skills first in each category
- Remove skills that are irrelevant to this specific role

### 3. Experience Section (MUST FIT ${pageLength} PAGES TOTAL)
${generateExperienceGuidelines(candidate, pageLengthConfig)}
- Reorder achievements within each role to put most relevant first
- Rewrite achievement bullets to emphasize aspects relevant to the target role
- Include metrics and quantified results wherever possible
- Use action verbs that match the job description's language
- If the job emphasizes leadership, highlight mentorship and team collaboration
- If the job emphasizes technical depth, highlight ${
    candidate.professionType === "developer"
      ? "architecture and technical decisions"
      : "system implementations and process improvements"
  }
- Keep bullets to ${pageLengthConfig.bulletLengthRange} - quality over quantity
- Select only the MOST RELEVANT achievements for the target role

### 4. Key Projects Section
- Include 2-3 most relevant projects from the candidate's experience
- Each project should have: name, 1-sentence description, technologies used, and quantified impact
- Prioritize projects that use ${
    candidate.professionType === "developer" ? "technologies" : "systems"
  } mentioned in the job description
- Tailor project descriptions to highlight aspects relevant to the target role
- Keep descriptions concise - 1 line max

### 5. Keyword Optimization
- Naturally incorporate exact phrases from the job description
- Match terminology (e.g., if JD says "${
    candidate.professionType === "developer" ? "React.js" : "ADP Workforce Now"
  }" use that exact term)
- Include both spelled-out and abbreviated versions where appropriate
- Don't keyword-stuff — it must read naturally

### 6. Truthfulness Rules (CRITICAL)
- NEVER add skills the candidate doesn't have
- NEVER fabricate achievements or metrics
- NEVER exaggerate scope or impact
- If the candidate lacks a required skill, do NOT add it — instead, highlight transferable skills
- It's okay to reframe or reword existing achievements, but not to invent new ones
- CRITICAL: You must ONLY use information provided in the candidate experience. If a skill or achievement is not explicitly mentioned, do NOT include it. When in doubt, leave it out.

### 7. ATS Optimization
- Use standard section headings (Professional Summary, Skills, Key Projects, Experience, Education)
- Avoid tables, columns, or complex formatting in the content
- Use standard job titles where possible
- Include both acronyms and full terms (e.g., "${
    candidate.professionType === "developer"
      ? "CI/CD (Continuous Integration/Continuous Deployment)"
      : "PCP (Payroll Certified Professional)"
  }")

## Example Transformation

### Before (Generic Achievement):
"${
    candidate.professionType === "developer"
      ? "Built front-end applications using React"
      : "Processed payroll for employees"
  }"

### After (Tailored for a job emphasizing ${
    candidate.professionType === "developer" ? "performance" : "accuracy"
  }):
"${
    candidate.professionType === "developer"
      ? "Architected high-performance React applications with code splitting and lazy loading, improving initial page load times by 40%"
      : "Processed full-cycle payroll for 1000+ employees with 99.9% accuracy, ensuring compliance with federal and provincial regulations"
  }"

### After (Tailored for a job emphasizing team leadership):
"${
    candidate.professionType === "developer"
      ? "Led front-end development of React applications, establishing component library standards adopted by a team of 8 developers"
      : "Led payroll team in implementing new ADP system across multiple unionized groups, training 5 staff members on new processes"
  }"

## Response Guidelines - EXACTLY ${pageLength} A4 PAGES (NOT MORE, NOT LESS)

1. Always return valid JSON
2. **STRICT LENGTH: The resume MUST fit on exactly ${pageLength} A4 pages** - this is critical
3. Focus on the last 10 years of experience
4. **Professional Summary: ${pageLengthConfig.summaryRange} sentences MAX** - concise but impactful
5. **Highlights of Qualifications: ${pageLengthConfig.highlightsRange} bullets** - each 1 line
${generateResponseBulletGuidelines(candidate, pageLengthConfig)}
9. **Skills section: Keep concise** - list format, not paragraphs
10. ${
    candidate.professionType === "grc"
      ? "**Education & Certifications: Include ALL certifications** - For GRC professionals, certifications (CISSP, CISA, CISM, CRISC, ISO 27001 LA, etc.) are critical qualifications. List ALL certifications from the candidate data, followed by academic degrees."
      : "Education section is brief — just degree and institution"
  }
11. Be specific and concrete with metrics, but keep bullets concise
12. Incorporate keywords naturally from the job description
13. Quality over quantity - select the MOST relevant achievements, don't include everything
14. If content exceeds ${pageLength} pages, reduce the number of bullets in older roles first

## Edge Cases

1. **If the job description is too vague:**
   Return the resume with a note in optimization_notes.suggestions explaining what additional information would help.

2. **If the candidate has no relevant experience:**
   Focus on transferable skills. In optimization_notes, set match_score to "Low" and provide honest feedback.

3. **If the job requires skills the candidate lacks:**
   Do NOT add those skills. Instead, highlight adjacent skills and note the gaps in optimization_notes.suggestions.

4. **If the input is not a valid job description:**
   Return an error message: { "error": "The provided text does not appear to be a job description. Please paste the full job posting." }`;

  return basePrompt;
};

// ============================================
// HELPER FUNCTIONS FOR DYNAMIC CONTENT
// ============================================

interface BulletConfig {
  summaryRange: string;
  highlightsRange: string;
  bulletCounts: { first: string; second: string; third: string; fourth: string };
  bulletLengthRange: string;
}

const generateExperienceBulletGuidelines = (
  candidate: CandidateData,
  config: BulletConfig
): string => {
  const experiences = candidate.experience;
  const { bulletCounts, bulletLengthRange } = config;

  const lines: string[] = [];
  if (experiences.length >= 1) {
    lines.push(`- Most recent role (${experiences[0].company}): ${bulletCounts.first} achievement bullets`);
  }
  if (experiences.length >= 2) {
    lines.push(`- Second role (${experiences[1].company}): ${bulletCounts.second} achievement bullets`);
  }
  if (experiences.length >= 3) {
    lines.push(`- Third role (${experiences[2].company}): ${bulletCounts.third} achievement bullets`);
  }
  if (experiences.length >= 4) {
    lines.push(`- Fourth role (${experiences[3].company}): ${bulletCounts.fourth} achievement bullets`);
  }
  lines.push(`- Keep each bullet to ${bulletLengthRange} maximum`);

  return lines.join("\n");
};

const generateSkillsOutputFormat = (candidate: CandidateData): string => {
  if (isDeveloperCandidate(candidate)) {
    return `    "skills": {
      "languages": ["skill1", "skill2"],
      "frameworks_libraries": ["skill1", "skill2"],
      "architecture": ["skill1", "skill2"],
      "tools_platforms": ["skill1", "skill2"],
      "methodologies": ["skill1", "skill2"]
    },`;
  }

  return `    "skills": {
      "payroll_systems": ["system1", "system2"],
      "hris_applications": ["app1", "app2"],
      "legislative_knowledge": ["regulation1", "regulation2"],
      "software_tools": ["tool1", "tool2"],
      "methodologies": ["method1", "method2"]
    },`;
};

const generateExperienceOutputFormat = (candidate: CandidateData, config: BulletConfig): string => {
  const experiences = candidate.experience;
  const counts = [config.bulletCounts.first, config.bulletCounts.second, config.bulletCounts.third, config.bulletCounts.fourth];

  return experiences
    .map((exp, index) => {
      const bulletCount = counts[index] || config.bulletCounts.fourth;
      return `      {
        "company": "${exp.company} (${bulletCount} achievements)",
        "location": "${exp.location}",
        "role": "Job Title",
        "dates": "${exp.dates}",
        "summary": "One sentence describing your role${
          index === 0 ? ", tailored to the target job" : ""
        }",
        "achievements": ["${bulletCount} detailed achievement bullets, ${config.bulletLengthRange} each"]
      }`;
    })
    .join(",\n");
};

const generateSkillCategoriesGuidelines = (
  candidate: CandidateData
): string => {
  if (isDeveloperCandidate(candidate)) {
    return "- Group logically: Languages, Frameworks, Architecture, Tools, Methodologies";
  }

  return "- Group logically: Payroll Systems, HRIS Applications, Legislative Knowledge, Software Tools, Methodologies";
};

const generateExperienceGuidelines = (candidate: CandidateData, config: BulletConfig): string => {
  const experiences = candidate.experience;
  const counts = [config.bulletCounts.first, config.bulletCounts.second, config.bulletCounts.third, config.bulletCounts.fourth];
  const lines: string[] = [];

  experiences.forEach((exp, index) => {
    const count = counts[index] || config.bulletCounts.fourth;
    const label = index === 0 ? ` (most recent)` : "";
    lines.push(`- **${exp.company}${label}: ${count} bullets** - each ${config.bulletLengthRange} max`);
  });

  return lines.join("\n");
};

const generateResponseBulletGuidelines = (candidate: CandidateData, config: BulletConfig): string => {
  const experiences = candidate.experience;
  const counts = [config.bulletCounts.first, config.bulletCounts.second, config.bulletCounts.third, config.bulletCounts.fourth];
  const ordinals = ["Most recent", "Second", "Third", "Fourth"];
  const lines: string[] = [];

  for (let i = 0; i < 3; i++) {
    if (i < experiences.length) {
      const count = counts[i] || config.bulletCounts.fourth;
      lines.push(`${6 + i}. **${ordinals[i]} role (${experiences[i].company}): ${count} achievement bullets** - each ${config.bulletLengthRange} max`);
    } else {
      lines.push(`${6 + i}. (No ${ordinals[i].toLowerCase()} role)`);
    }
  }

  if (experiences.length >= 4) {
    lines.push(`9. **Fourth role (${experiences[3].company}): ${config.bulletCounts.fourth} achievement bullets** - each ${config.bulletLengthRange} max`);
  }

  return lines.join("\n");
};

// ============================================
// LEGACY EXPORT (for backward compatibility)
// ============================================

export const SYSTEM_PROMPT = generateSystemPrompt({
  id: "johnson-ojo",
  professionType: "developer",
  name: "Johnson Ojo",
  email: "opeyemiojoj@gmail.com",
  phone: "(437) 778-5339",
  location: "Toronto, ON",
  linkedin: "linkedin.com/in/opeyemi-ojo-86649629",
  yearsOfExperience: "7+",
  professionalTitle: "Senior Front-End Developer",
  skills: {
    languages: "JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL",
    frameworks_libraries: "React, Next.js, Redux, Node.js, GraphQL, REST APIs",
    architecture:
      "Microfrontends, Single-Page Applications (SPA), Module Federation, Component Libraries",
    css: "SASS, LESS, Responsive Design, Cross-Browser Compatibility",
    tools: "Webpack, Babel, Git, GitHub, npm, CI/CD Pipelines",
    testing: "Jest, React Testing Library, Playwright (E2E)",
    methodologies: "Agile/Scrum, Test-Driven Development, Code Review",
    design: "Figma, Adobe XD (Basic)",
    other:
      "Web Accessibility Standards, OWASP Security Basics, Performance Optimization, Code Splitting, Lazy Loading",
  },
  experience: [
    {
      company: "Bell Canada",
      location: "Mississauga, ON",
      role: "Senior Front-End Engineer",
      dates: "Jan 2023 – Present",
      achievements: [],
    },
    {
      company: "Canada Revenue Agency",
      location: "Hamilton, ON",
      role: "Front-End Developer",
      dates: "Oct 2020 – Dec 2022",
      achievements: [],
    },
    {
      company: "Genpact",
      location: "Mississauga, ON",
      role: "Junior Front-End Developer",
      dates: "Jan 2018 – Sept 2020",
      achievements: [],
    },
  ],
  education: [],
});

export const formatUserMessage = (
  jobDescription: string,
  candidateExperience: string,
  additionalKeywords: string[] = []
): string => {
  const additionalKeywordsSection =
    additionalKeywords.length > 0
      ? `

## Additional Keywords (User Confirmed Experience)

The user has confirmed they have experience with the following skills. Please incorporate them into the resume:
${additionalKeywords.map((k) => `- ${k}`).join("\n")}
`
      : "";

  return `## Job Description

<job_description>
${jobDescription}
</job_description>

## Candidate Experience

<candidate_experience>
${candidateExperience}
</candidate_experience>
${additionalKeywordsSection}
## Instructions

Generate a tailored resume for this specific job. Return the response as a JSON object following the output format specified in your instructions.${
    additionalKeywords.length > 0
      ? " Remember to incorporate the additional keywords the user confirmed they have experience with."
      : ""
  }`;
};
