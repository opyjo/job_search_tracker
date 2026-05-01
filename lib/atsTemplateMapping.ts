import { ATS_FIXED_PROFILE } from "./atsFixedProfile";
import { DynamicATSResume } from "./types";

const joinNonEmpty = (items: Array<string | undefined>, separator = " | "): string =>
  items.map((item) => item?.trim()).filter(Boolean).join(separator);

const formatHighlights = (highlights: string[] = []): string =>
  highlights.map((item) => `- ${item}`).join("\n");

const formatSkills = (resume: DynamicATSResume): string =>
  (resume.skills || [])
    .filter((group) => group.label && group.items?.length)
    .map((group) => `${group.label}: ${group.items.join(", ")}`)
    .join("\n");

const formatExperience = (resume: DynamicATSResume): string =>
  (resume.experience || [])
    .map((exp) => {
      const heading = joinNonEmpty([exp.company, exp.location ? `- ${exp.location}` : ""], " ");
      const roleLine = `${exp.role} | ${exp.dates}`;
      const achievements = (exp.achievements || []).map((item) => `- ${item}`).join("\n");
      return [heading, roleLine, achievements].filter(Boolean).join("\n");
    })
    .join("\n\n");

const formatEducation = (resume: DynamicATSResume): string =>
  (resume.education || [])
    .map((edu) =>
      joinNonEmpty(
        [edu.degree, edu.institution, edu.location ? edu.location : undefined],
        " - "
      )
    )
    .join("\n");

const formatAdditionalSections = (resume: DynamicATSResume): string =>
  (resume.additional_sections || [])
    .map((section) => {
      const bullets = (section.bullets || []).map((item) => `- ${item}`).join("\n");
      return [section.heading, bullets].filter(Boolean).join("\n");
    })
    .join("\n\n");

export const mapResumeToTemplateData = (
  resume: DynamicATSResume
): Record<string, unknown> => {
  const contactLine = joinNonEmpty([
    ATS_FIXED_PROFILE.email,
    ATS_FIXED_PROFILE.phone,
    resume.contact.location,
    resume.contact.linkedin,
  ]);

  const highlightsBlock = formatHighlights(resume.highlights || []);
  const skillsBlock = formatSkills(resume);
  const experienceBlock = formatExperience(resume);
  const educationBlock = formatEducation(resume);
  const additionalSectionsBlock = formatAdditionalSections(resume);

  return {
    name: ATS_FIXED_PROFILE.name,
    full_name: ATS_FIXED_PROFILE.name,
    candidate_name: ATS_FIXED_PROFILE.name,
    email: ATS_FIXED_PROFILE.email,
    contact_email: ATS_FIXED_PROFILE.email,
    phone: ATS_FIXED_PROFILE.phone,
    contact_phone: ATS_FIXED_PROFILE.phone,
    location: resume.contact.location || "",
    linkedin: resume.contact.linkedin || "",
    contact_line: contactLine,
    contact_info: contactLine,
    target_job_title: resume.target_job_title || "",
    job_title: resume.target_job_title || "",
    title: resume.target_job_title || "",
    professional_summary: resume.professional_summary || "",
    summary: resume.professional_summary || "",
    profile_summary: resume.professional_summary || "",
    highlights_block: highlightsBlock,
    highlights: highlightsBlock,
    skills_block: skillsBlock,
    skills: skillsBlock,
    experience_block: experienceBlock,
    experience: experienceBlock,
    education_block: educationBlock,
    education: educationBlock,
    additional_sections_block: additionalSectionsBlock,
    additional_sections: additionalSectionsBlock,

    // Loop-friendly aliases for templates using block iteration
    highlights_items: (resume.highlights || []).map((item) => ({ item })),
    skill_groups: (resume.skills || []).map((group) => ({
      label: group.label,
      items: group.items.join(", "),
      items_list: group.items,
    })),
    experience_entries: (resume.experience || []).map((exp) => ({
      company: exp.company,
      location: exp.location || "",
      role: exp.role,
      dates: exp.dates,
      achievements: exp.achievements || [],
      achievements_block: (exp.achievements || []).map((item) => `- ${item}`).join("\n"),
    })),
    education_entries: (resume.education || []).map((edu) => ({
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location || "",
    })),
    additional_section_entries: (resume.additional_sections || []).map((section) => ({
      heading: section.heading,
      bullets: section.bullets || [],
      bullets_block: (section.bullets || []).map((item) => `- ${item}`).join("\n"),
    })),
  };
};
