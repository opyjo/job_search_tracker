import { CandidateData, isDeveloperCandidate, isPayrollCandidate, isGRCCandidate } from "./types";
import { parseProjectsForPrompt } from "./parseProjects";

/**
 * Condense the full projects markdown to just project titles and first sentence.
 * This keeps the prompt small while giving the model enough to work with.
 */
function condensedProjects(): string {
  const raw = parseProjectsForPrompt();
  if (!raw) return "No project data available.";

  const sections = raw.split(/^---$/m);
  const summaries: string[] = [];

  for (const section of sections) {
    const lines = section.trim().split("\n").filter(Boolean);
    // Extract company heading (## N. Company)
    const companyLine = lines.find(l => l.startsWith("## "));
    const roleLine = lines.find(l => l.startsWith("**Role:**"));
    // Extract project titles (bold lines that aren't Role/Key)
    const projectTitles = lines
      .filter(l => l.startsWith("**") && !l.startsWith("**Role:") && !l.startsWith("- **"))
      .map(l => l.replace(/\*\*/g, "").trim());

    if (companyLine && projectTitles.length > 0) {
      const role = roleLine ? ` | ${roleLine.replace(/\*\*/g, "").trim()}` : "";
      summaries.push(`${companyLine.replace("## ", "")}${role}\n  Projects: ${projectTitles.join("; ")}`);
    }
  }

  return summaries.join("\n");
}

export const generateInterviewPrepSystemPrompt = (candidate: CandidateData): string => {
  const getSkillsSummary = (): string => {
    if (isDeveloperCandidate(candidate)) {
      return `${candidate.skills.languages}, ${candidate.skills.frameworks_libraries}`;
    } else if (isPayrollCandidate(candidate)) {
      return `${candidate.skills.payroll_systems}, ${candidate.skills.hris_applications}`;
    } else if (isGRCCandidate(candidate)) {
      return `${candidate.skills.frameworks_standards}, ${candidate.skills.grc_platforms}`;
    }
    return "";
  };

  const getProfessionDescription = (): string => {
    if (isDeveloperCandidate(candidate)) return "front-end development";
    if (isPayrollCandidate(candidate)) return "payroll management and system implementation";
    if (isGRCCandidate(candidate)) return "governance, risk, and compliance";
    return "professional services";
  };

  const projectsSummary = condensedProjects();
  const skillsSummary = getSkillsSummary();
  const keyAchievements = candidate.experience[0]?.achievements?.slice(0, 5) ?? [];
  const professionDescription = getProfessionDescription();
  const allExperience = candidate.experience
    .map(exp => `- ${exp.role} at ${exp.company} (${exp.dates}): ${(exp.achievements ?? []).slice(0, 3).join("; ")}`)
    .join("\n");

  return `You are an interview coach. Analyze a job description and prepare interview talking points for the candidate below.

CRITICAL FORMATTING RULES:
- Return ONLY raw JSON. No markdown fences, no \`\`\`, no explanation text.
- Every string value must be 1-2 sentences max. Be concise.
- Keep the total response under 3000 tokens.

JSON structure:
{"matched_projects":[{"project_name":"str","relevance_score":"high"|"medium"|"low","why_relevant":"1 sentence","talking_points":["2-3 short bullets"],"technologies_to_highlight":["tech"]}],"interview_questions":[{"question":"str","question_type":"behavioral"|"technical"|"situational"|"culture","suggested_answer":"2-3 sentence STAR answer","key_points":["2 bullets"]}],"key_themes":[{"theme":"str","why_this_matters":"1 sentence","proof_points":["2 items"]}],"metadata":{"role_detected":"str","company_detected":"str","top_keywords":["5 keywords"],"interview_style_guess":"behavioral"|"technical"|"mixed","preparation_tips":["3 tips"]}}

Limits: 3 projects, 4 questions, 2 themes. Only use real projects/experience below.

## Candidate
${candidate.name} | ${candidate.professionalTitle} | ${candidate.yearsOfExperience}yr ${professionDescription}
Skills: ${skillsSummary}

Experience:
${allExperience}

Top achievements: ${keyAchievements.join("; ")}

## Projects
${projectsSummary}`;
};

export const formatInterviewPrepUserMessage = (
  jobDescription: string,
  companyName?: string
): string => {
  const companySection = companyName
    ? `**Company:** ${companyName}\n\n`
    : "";

  return `${companySection}## Job Description

<job_description>
${jobDescription}
</job_description>

Analyze this job description and generate structured interview preparation materials using the candidate's real experience and projects. Return the response as a JSON object following the output format specified in your instructions.`;
};
