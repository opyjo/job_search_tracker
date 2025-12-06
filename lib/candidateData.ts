import { CandidateData } from "./types";

export const candidateData: CandidateData = {
  name: "Johnson Ojo",
  email: "opeyemiojoj@gmail.com",
  phone: "(437) 778-5339",
  location: "Toronto, ON",
  linkedin: "linkedin.com/in/opeyemi-ojo-86649629",
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
      "Web Accessibility Standards, OWASP Security Basics, Performance Optimization, Code Splitting, Lazy Loading",
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
        "Developed the Unified Promocodes Management application, achieving 30% increase in promotional efficiency and 25% reduction in customer service queries, streamlining promotional code management across Bell's telecommunications services",
        "Spearheaded Playwright end-to-end testing implementation, resulting in 40% faster test execution and 35% improvement in bug detection accuracy, establishing new benchmarks for software quality assurance",
        "Led cross-functional collaboration between front-end, back-end, and billing teams to ensure seamless system integration across Bell's telecommunications infrastructure",
        "Facilitated 20% improvement in cross-functional team collaboration by aligning front-end functionalities with overall system architecture, significantly boosting user experience and system reliability",
        "Mentored 3 junior developers in React best practices, code review processes, and front-end architecture patterns, conducting regular code reviews and providing technical guidance",
        "Managed build process for front-end assets using Webpack, optimizing application for maximum speed and scalability",
        "Implemented state-of-the-art security practices in web applications, including XSS and CSRF protection, to safeguard user data",
        "Built scalable single-page applications (SPAs) with React, optimizing for performance and user engagement",
        "Utilized Next.js for server-side rendering and static site generation, enhancing SEO and load times for content-rich websites",
        "Collaborated in Agile environment, participating in sprints, stand-ups, and retrospectives to continuously improve processes and outcomes",
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
        "Designed user-friendly interfaces, integrated backend services, and ensured seamless functionality across various platforms",
        "Delivered features with high standard of quality, implementing robust testing protocols that reduced bug rates by 30% through meticulous unit and integration testing",
        "Consistently applied engineering best practices throughout development, resulting in maintainable, reliable, and secure systems",
        "Adopted modular coding approach and implemented CI/CD pipelines, improving code quality and deployment efficiency across multiple projects",
        "Applied fixes, patches, and upgrades from product vendors to maintain system security and performance",
        "Led bi-weekly sprint planning meetings, ensuring team alignment with project goals and timelines, resulting in 20% increase in team productivity",
        "Collaborated effectively with globally distributed team, coordinating across different time zones to deliver key features using Slack, JIRA, and Confluence",
      ],
    },
    {
      company: "Genpact",
      location: "Mississauga, ON",
      role: "Junior Front-End Developer",
      dates: "Jan 2018 – Sept 2020",
      achievements: [
        "Spearheaded responsive redesign of main web application, reworking CSS and JavaScript to ensure optimal viewing on various devices, resulting in 40% increase in mobile user engagement",
        "Improved site performance score by 35% on Google PageSpeed Insights through image compression, CSS and JavaScript minification, and lazy loading implementation",
        "Led cross-browser compatibility effort across all major browsers including older versions, resulting in 15% rise in user accessibility through extensive testing and HTML/CSS adjustments",
        "Developed and integrated multiple RESTful APIs and utilized AJAX for asynchronous data loading, significantly improving interactivity and functionality of web applications",
        "Enhanced user experiences resulting in 20% increase in user retention rates through improved interactivity and functionality",
        "Built strong knowledge of operating systems, middleware, and other technologies for building and maintaining multi-tiered enterprise business solutions",
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
  keyProjects: [
    {
      name: "Enterprise Subscription Management Platform",
      description: "Led development of a microfrontend-based subscription management system handling Bell's streaming partnerships with Netflix, Disney+, and Crave",
      technologies: ["React", "TypeScript", "Module Federation", "GraphQL", "Redux"],
      impact: "Serving millions of subscribers with 99.9% uptime",
    },
    {
      name: "Unified Promocodes Management System",
      description: "Built end-to-end promotional code management application for Bell's telecommunications services",
      technologies: ["Next.js", "TypeScript", "REST APIs", "Node.js"],
      impact: "30% increase in promotional efficiency, 25% reduction in customer service queries",
    },
    {
      name: "Government Tax Portal Enhancement",
      description: "Delivered secure, accessible web applications for CRA tax services ensuring WCAG 2.1 AA compliance",
      technologies: ["React", "TypeScript", "Jest", "CI/CD Pipelines"],
      impact: "Used by millions of Canadians with 30% reduction in bug rates",
    },
  ],
};

export const formatCandidateExperience = (): string => {
  const { name, email, phone, location, linkedin, skills, experience, education, keyProjects } =
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

  const keyProjectsText = keyProjects
    ? keyProjects
        .map(
          (proj) =>
            `- ${proj.name}: ${proj.description} (Technologies: ${proj.technologies.join(", ")})${proj.impact ? ` — Impact: ${proj.impact}` : ""}`
        )
        .join("\n")
    : "";

  return `**Name:** ${name}
**Contact:** ${email} | ${phone} | ${location}
**LinkedIn:** ${linkedin}

**Professional Summary:**
A proficient Front-End Developer with 7+ years of experience in building high-performance, scalable web applications. Skilled in modern web technologies including JavaScript, TypeScript, Redux, React, NextJS, and HTML/CSS, with a strong focus on creating responsive and user-friendly interfaces. Experienced in agile methodologies and cross-functional teamwork, consistently delivering projects with a keen eye for detail and maintainability.

**Highlights of Qualifications:**
- Knowledge of Agile development methodologies demonstrating deep understanding of iterative development, continuous integration, and collaborative project management
- Extensive knowledge in advanced React concepts, JavaScript, HTML5, and CSS, showcasing expertise in building sophisticated, dynamic web interfaces and single-page applications
- In-depth understanding of web standards, including cross-browser compatibility, progressive enhancement, graceful degradation, and responsive design
- Deep understanding of REST principles with substantial experience in working with and implementing backend APIs
- Mastery in foundations of the web, including vanilla JavaScript, HTML, and CSS3, ensuring robust and efficient coding practices
- Proven track record of mentoring junior developers and leading cross-functional teams in enterprise environments

**Skills:**
${skillsText}

**Key Projects:**
${keyProjectsText}

**Experience:**

${experienceText}

**Education:**
${educationText}`;
};
