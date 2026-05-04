import { DeveloperCandidateData } from "./types";
import { formatCandidateExperience } from "./candidateData";

export const atsResumeProfile: DeveloperCandidateData = {
  id: "ats-resume-profile",
  professionType: "developer",
  name: "Johnson Ojo",
  email: "johnsonoojo@gmail.com",
  phone: "(437)-778-5339",
  location: "Mississauga, ON",
  linkedin: "",
  yearsOfExperience: "10+",
  professionalTitle: "Frontend Engineer",
  skills: {
    languages: "JavaScript (ES6+), TypeScript, HTML5, CSS3",
    frameworks_libraries:
      "React, Next.js, Redux, Playwright, Jest, React Testing Library",
    architecture:
      "Single-Page Applications, Component-Based Architecture, REST API Integration",
    css: "SASS, LESS, Responsive Design, Cross-Browser Compatibility",
    tools:
      "Webpack, Babel, npm, Git, GitHub, JIRA, Confluence, Slack, Figma",
    testing: "Playwright, Jest, React Testing Library, Integration Testing",
    methodologies: "Agile, Scrum, CI/CD, SDLC Best Practices",
    design: "Figma, Adobe XD (Basic)",
    other:
      "Web Accessibility Standards, Performance Optimization, Security Best Practices (XSS/CSRF)",
  },
  experience: [
    {
      company: "Bell Canada",
      location: "Mississauga, ON",
      role: "Software Engineer",
      dates: "Jan 2023 – Present",
    },
    {
      company: "Canada Revenue Agency",
      location: "Hamilton, ON",
      role: "Front End Developer",
      dates: "Oct 2020 – Dec 2022",
    },
    {
      company: "General Electric (Genpact)",
      location: "Mississauga, ON",
      role: "Junior Front-End Developer",
      dates: "Jan 2018 – Sept 2020",
    },
    {
      company: "CIBC",
      location: "Ontario, Canada",
      role: "Front-End Developer",
      dates: "Mar 2017 – Dec 2020",
    },
    {
      company: "Skye Bank Plc",
      location: "Nigeria",
      role: "Technical Support / Early Career IT",
      dates: "Jan 2014 – Feb 2017",
    },
  ],
  education: [
    {
      degree: "Diploma in Computer Programming",
      institution: "Algonquin College, Ottawa",
    },
    {
      degree: "Bachelor of Science",
      institution: "Obafemi Awolowo University",
    },
  ],
  certifications: [
    {
      degree: "Chartered Professional Accountant (CPA)",
      institution: "CPA Ontario",
    },
    {
      degree: "Association of Chartered Certified Accountants (ACCA)",
      institution: "ACCA (UK/Global)",
    },
    {
      degree: "Advanced Diploma in Accounting and Business",
      institution: "ACCA Pathway",
    },
  ],
};

export const formatATSResumeProfileExperience = (includeCertifications = false): string => {
  const baseText = formatCandidateExperience(atsResumeProfile);

  if (!includeCertifications || !atsResumeProfile.certifications?.length) {
    return baseText;
  }

  const designationsText = atsResumeProfile.certifications
    .map((c) => `- ${c.degree} — ${c.institution}`)
    .join("\n");

  return `${baseText}\n\n**Professional Designations:**\n${designationsText}`;
};

export const formatATSResumeProfileRoles = (): string =>
  atsResumeProfile.experience
    .map(
      (exp, index) =>
        `${index + 1}. ${exp.company} | ${exp.dates} | Current Role: ${exp.role}`
    )
    .join("\n");
