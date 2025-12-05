import { CandidateData } from "./types";

export const candidateData: CandidateData = {
  name: "Johnson Ojo",
  email: "johnsonoojo@gmail.com",
  phone: "(437) 778-5339",
  location: "Toronto, ON",
  linkedin: "linkedin.com/in/johnsonojo",
  skills: {
    languages: "JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL",
    frameworks_libraries:
      "React, Next.js, Redux, Node.js, GraphQL, REST APIs",
    architecture:
      "Microfrontends, Single-Page Applications (SPA), Module Federation, Component Libraries",
    css: "SASS, LESS, Responsive Design, Cross-Browser Compatibility",
    tools: "Webpack, Babel, Git, GitHub, npm, CI/CD Pipelines",
    testing: "Jest, React Testing Library, Playwright (E2E)",
    methodologies: "Agile/Scrum, Test-Driven Development, Code Review",
    design: "Figma, Adobe XD (Basic)",
    other:
      "Web Accessibility Standards, OWASP Security Basics, Performance Optimization",
  },
  experience: [
    {
      company: "Bell Canada",
      location: "Mississauga, ON",
      role: "Senior Front-End Engineer",
      dates: "Jan 2023 – Present",
      achievements: [
        "Lead front-end development for enterprise subscription management systems supporting Bell's streaming partnerships with Netflix, Disney+, and Crave, serving millions of Canadian subscribers",
        "Architected and implemented microfrontend architecture for the Subscription Manager platform, enabling independent deployment of 5+ applications and reducing release cycle time by 40%",
        "Built billing integration workflows processing multi-partner subscription bundles (Netflix, Disney+, Crave) handling millions in monthly recurring revenue",
        "Developed the Unified Promocodes Management application, achieving 30% increase in promotional efficiency and 25% reduction in customer service queries",
        "Spearheaded Playwright end-to-end testing implementation, resulting in 40% faster test execution and 35% improvement in bug detection accuracy",
        "Led cross-functional collaboration between front-end, back-end, and billing teams to ensure seamless system integration across Bell's telecommunications infrastructure",
        "Mentored 3 junior developers in React best practices, code review processes, and front-end architecture patterns",
        "Managed build process for front-end assets using Webpack, optimizing application for maximum speed and scalability",
        "Implemented state-of-the-art security practices in web applications, including XSS and CSRF protection",
        "Utilized Next.js for server-side rendering and static site generation, enhancing SEO and load times",
      ],
    },
    {
      company: "Canada Revenue Agency",
      location: "Hamilton, ON",
      role: "Front-End Developer",
      dates: "Oct 2020 – Dec 2022",
      achievements: [
        "Delivered secure, accessible web applications for government tax services used by millions of Canadians",
        "Successfully drove multiple projects from concept to deployment, demonstrating proficiency in each stage of the software development lifecycle",
        "Reduced production bug rate by 30% through implementation of comprehensive unit and integration testing protocols",
        "Implemented CI/CD pipelines improving deployment efficiency and code quality across multiple projects",
        "Led bi-weekly sprint planning meetings, ensuring team alignment and achieving 20% increase in team productivity",
        "Collaborated with globally distributed teams across time zones using Slack, JIRA, and Confluence",
        "Applied fixes, patches, and upgrades from product vendors",
        "Designed user-friendly interfaces, integrated backend services, and ensured seamless functionality across various platforms",
      ],
    },
    {
      company: "Genpact",
      location: "Mississauga, ON",
      role: "Junior Front-End Developer",
      dates: "Jan 2018 – Sept 2020",
      achievements: [
        "Led responsive redesign initiative resulting in 40% increase in mobile user engagement",
        "Improved site performance score by 35% on Google PageSpeed Insights through image compression, code minification, and lazy loading",
        "Achieved 15% rise in user accessibility through cross-browser compatibility testing and adjustments",
        "Developed and integrated multiple RESTful APIs and utilized AJAX for asynchronous data loading",
        "Increased user retention rates by 20% through improved interactivity and functionality",
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
      institution: "Obafemi Awolowo University, Nigeria",
    },
  ],
};

export const formatCandidateExperience = (): string => {
  const { name, email, phone, location, linkedin, skills, experience, education } =
    candidateData;

  const skillsText = `
- Languages: ${skills.languages}
- Frameworks/Libraries: ${skills.frameworks_libraries}
- Architecture: ${skills.architecture}
- CSS: ${skills.css}
- Tools: ${skills.tools}
- Testing: ${skills.testing}
- Methodologies: ${skills.methodologies}
- Design: ${skills.design}
- Other: ${skills.other}`;

  const experienceText = experience
    .map(
      (exp) =>
        `${exp.company} — ${exp.location}
${exp.role} | ${exp.dates}
${exp.achievements.map((a) => `- ${a}`).join("\n")}`
    )
    .join("\n\n");

  const educationText = education
    .map((edu) => `- ${edu.degree} — ${edu.institution}`)
    .join("\n");

  return `**Name:** ${name}
**Contact:** ${email} | ${phone} | ${location}
**LinkedIn:** ${linkedin}

**Skills:**
${skillsText}

**Experience:**

${experienceText}

**Education:**
${educationText}`;
};

