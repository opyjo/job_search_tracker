import { DeveloperCandidateData } from "./types";
import { formatCandidateExperience } from "./candidateData";

export const atsResumeProfile: DeveloperCandidateData = {
  id: "ats-resume-profile",
  professionType: "developer",
  name: "Johnson Ojo",
  email: "johnsonoojo@gmail.com",
  phone: "(437)-778-5339",
  location: "Mississauga, ON",
  linkedin: "linkedin.com/in/opeyemi-ojo-86649629",
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
      achievements: [
        "Developed Unified Promocodes Management application, improving promotional code efficiency by 30% and reducing related customer service queries by 25%",
        "Implemented Playwright end-to-end testing, improving testing speed by 40% and increasing bug detection accuracy by 35%",
        "Built scalable React single-page applications and Next.js pages with strong focus on performance and user engagement",
        "Aligned front-end functionality with system architecture, driving a 20% improvement in cross-functional collaboration",
        "Led code reviews and mentored junior developers on front-end best practices",
      ],
    },
    {
      company: "Canada Revenue Agency",
      location: "Hamilton, ON",
      role: "Front End Developer",
      dates: "Oct 2020 – Dec 2022",
      achievements: [
        "Delivered multiple projects from concept to deployment with strong software development lifecycle execution",
        "Reduced bug rates by 30% by implementing robust unit and integration testing standards",
        "Applied engineering best practices for maintainable, secure, and reliable systems",
        "Coordinated sprint planning and cross-timezone collaboration to improve team productivity by 20%",
      ],
    },
    {
      company: "General Electric (Genpact)",
      location: "Mississauga, ON",
      role: "Junior Front-End Developer",
      dates: "Jan 2018 – Sept 2020",
      achievements: [
        "Redesigned primary web application for responsive behavior, increasing mobile user engagement by 40%",
        "Improved site performance score by 35% through optimization techniques including lazy loading and asset minification",
        "Enhanced cross-browser compatibility resulting in a 15% increase in user accessibility",
        "Built and integrated REST APIs and AJAX workflows that improved application interactivity and retention by 20%",
      ],
    },
    {
      company: "CIBC + Canada Revenue Agency",
      location: "Ontario, Canada",
      role: "Front-End Developer",
      dates: "Mar 2017 – Dec 2020",
      achievements: [
        "Supported front-end modernization initiatives across enterprise and public-sector projects",
        "Implemented user-facing features with emphasis on accessibility, reliability, and maintainability",
        "Collaborated with QA and backend teams to deliver business-critical releases in Agile sprints",
      ],
    },
    {
      company: "Skye Bank Plc",
      location: "Nigeria",
      role: "Technical Support / Early Career IT",
      dates: "Jan 2014 – Feb 2017",
      achievements: [
        "Provided foundational technical support and operational system assistance",
        "Contributed to issue triage, process documentation, and stakeholder support workflows",
      ],
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
};

export const formatATSResumeProfileExperience = (): string =>
  formatCandidateExperience(atsResumeProfile);

export const formatATSResumeProfileRoles = (): string =>
  atsResumeProfile.experience
    .map(
      (exp, index) =>
        `${index + 1}. ${exp.company} | ${exp.dates} | Current Role: ${exp.role}`
    )
    .join("\n");
