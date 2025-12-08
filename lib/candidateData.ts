import {
  CandidateData,
  DeveloperCandidateData,
  PayrollCandidateData,
  isDeveloperCandidate,
  isPayrollCandidate,
} from "./types";

// ============================================
// JOHNSON OJO - FRONT-END DEVELOPER
// ============================================

export const johnsonOjoData: DeveloperCandidateData = {
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
      description:
        "Led development of a microfrontend-based subscription management system handling Bell's streaming partnerships with Netflix, Disney+, and Crave",
      technologies: ["React", "TypeScript", "Module Federation", "GraphQL", "Redux"],
      impact: "Serving millions of subscribers with 99.9% uptime",
    },
    {
      name: "Unified Promocodes Management System",
      description:
        "Built end-to-end promotional code management application for Bell's telecommunications services",
      technologies: ["Next.js", "TypeScript", "REST APIs", "Node.js"],
      impact: "30% increase in promotional efficiency, 25% reduction in customer service queries",
    },
    {
      name: "Government Tax Portal Enhancement",
      description:
        "Delivered secure, accessible web applications for CRA tax services ensuring WCAG 2.1 AA compliance",
      technologies: ["React", "TypeScript", "Jest", "CI/CD Pipelines"],
      impact: "Used by millions of Canadians with 30% reduction in bug rates",
    },
  ],
};

// ============================================
// ADE OJO - PAYROLL SUPERVISOR
// ============================================

export const adeOjoData: PayrollCandidateData = {
  id: "ade-ojo",
  professionType: "payroll",
  name: "Ade Ojo (PCP)",
  email: "adejokeojo1409@gmail.com",
  phone: "(437) 778-6581",
  location: "Burlington, ON",
  linkedin: "",
  yearsOfExperience: "5+",
  professionalTitle: "Payroll Supervisor",
  skills: {
    payroll_systems: "ADP Global View, Kronos, SAP HRMS, HCM, HR Self-Serve Web Tools",
    hris_applications: "Oracle, Service Now, Success Factors, Workday, CRM Applications",
    legislative_knowledge:
      "Income Tax Act, Employment Insurance Act, Canada Pension Plan Act, Employment and Labour Standards Acts, Provincial Income Tax Acts, Workers' Compensation Legislation, HOOPP, OMERS",
    software_tools:
      "Microsoft Office Suite, Outlook, MS Word, OneNote, Advanced Microsoft Excel (VLOOKUP, Pivot Tables)",
    methodologies: "Lean Six Sigma, Business Analysis, Process Management, Project Planning",
    certifications:
      "Payroll Certified Professional (PCP), Payroll Leadership Professional (PLP - in view 2025), Oracle Certified Professional (SQL, Oracle 10g)",
  },
  experience: [
    {
      company: "Joseph Brant Hospital",
      location: "Burlington, ON",
      role: "Senior Payroll Specialist/Supervisor",
      dates: "Dec 2021 – Present",
      achievements: [
        "Led and managed the implementation of the ADP payroll system, ensuring successful deployment across various unionized and non-unionized groups",
        "Oversee various payroll technical projects, from collecting business requirements, analyzing data, designing features, and configuring systems, to testing and implementing the project",
        "Leverage analytics and reporting data to support optimization efforts, identifying and quantifying enhancement opportunities",
        "Participate in system enhancements for process improvements, contributing as a tester for all payroll initiatives, accessing staff performance and making recommendations for training and development",
        "Ensures all payroll payments, calculations and deductions are processed accurately and on time including pension contributions, tax withholdings and other garnishments",
        "Identify, research, and resolve payroll discrepancies and inconsistencies and recommend, develop and implement corrective actions to ensure accurate recording and reporting of payroll transactions",
        "Interprets, applies and ensures compliance with legislation, internal policies and union contracts",
        "Conducts or oversees research and analysis to implement any new legislation affecting payroll processes. Interprets day-to-day business objectives and preparation/execution of operational practices/work programs",
        "Provides guidance to and shares knowledge with colleagues/team members as subject matter expert. Identifies process improvement initiatives and defines standards for new processes",
        "Responsible for preparation of payroll accruals, accurate annual production and distribution of T4s and T4As",
        "Completes all payroll and accounting reporting documents, audits and internal and external (legislative) reporting requirements",
        "Adhere to payroll best practices, understanding risks, and ensuring compliance with requirements for employment records, record maintenance, and separation of duties between HR and payroll",
        "Responding to inquiries from CRA, Auditors, internal departments, and management regarding payroll matters in a prompt, courteous, and efficient manner",
        "Processing payments to third parties – liens, garnishments, union dues, various withholding RRSP, and pension payments ensuring that deductions are by provincial and federal legislations and according to union agreements and corporate policies",
      ],
    },
    {
      company: "Closing the Gap Healthcare",
      location: "Mississauga, ON",
      role: "Payroll Specialist",
      dates: "Feb 2021 – Dec 2021",
      achievements: [
        "Processing the full cycle of biweekly and monthly payrolls for over 1000 salary, hourly employees, and independent contractors in both union and non-union environments in an accurate and timely manner",
        "Calculate all applicable retro pay and process pay, including performance pay for the next payroll cycle",
        "Responding to inquiries from CRA, Auditors, internal departments, and management regarding payroll matters in a prompt, courteous, and efficient manner",
        "Interpreting multiple union contracts ensuring all calculations in the payroll are correct and accurate",
        "Processing payments to third parties – liens, garnishments, union dues, various withholding RRSP, and pension payments ensuring that deductions are by provincial and federal legislations and according to union agreements and corporate policies",
        "Processes payroll documents received from Human Resources or Departments and determines the necessary adjustments to gross pay",
        "Calculates vacation pay, retroactive pay, sick leave, and retiring allowance, instead of notice pay, and inputs adjustments into the payroll system",
        "Adjusts tax on final payments based on tax waivers received from the Canada Revenue Agency (CRA)",
        "Calculates, prepares correspondence, collects, and adjusts employee records for overpayments",
        "Answers inquiries in person and by telephone from employees, and departments including outside agencies such as CRA and Human Resources Skills & Development Canada",
        "Recalls/cancels direct deposits as required and reissues rejected direct deposits from the bank",
        "Adjusts employee's gross pay for attendance docking exceptions",
        "Prepares journals to fund sick leave payments from reserve accounts",
        "Prepares adjustments to employee records for the preparation of annual T4/T4As",
        "Calculate the average earnings basis to process timely lost time workers' benefit payments for WSIB payment",
      ],
    },
    {
      company: "Royal Bank of Canada",
      location: "Mississauga, ON",
      role: "HR Shared Services (Payroll Specialist)",
      dates: "Oct 2019 – Feb 2021",
      achievements: [
        "Processed Payroll for about 60,000 employees across all provinces in Canada, using an in-house SAP application",
        "Reviewed Payroll forms identified errors (which will prevent accurate and complete processing), and initiated escalation process for immediate and timely correction",
        "Escalated processing issues to the Manager of Payroll Processing Operations to ensure a timely flow of changes are processed with minimum impact on our employees' pay",
        "Processed Payroll requests on hires, terminations, bonus payment compensation, transfers, leave of absence, additional payments, and return from leave, allowances, on-call payments, and employee information updates using in-house SAP and Service Now application",
        "Updated and assisted with creating job aids, implementation, and training of employees to improve the efficiency and accuracy of the payroll processing output",
        "Ensured employee information is maintained securely as per privacy policies",
        "Executed customer-oriented service delivery to enable the RBC units to focus on business & revenue generation activities",
        "Created, Updated, and maintained standard documentation for payroll and benefit procedures, process maps, and task lists",
        "Participated in the successful migration of Manual payroll requests to Robotic automation",
      ],
    },
  ],
  education: [
    {
      degree: "Payroll Certified Professional (PCP)",
      institution: "National Payroll Institute",
    },
    {
      degree: "Payroll Leadership Professional (PLP)",
      institution: "National Payroll Institute (in view 2025)",
    },
    {
      degree: "Lean Six Sigma (Process Improvement)",
      institution: "Certified",
    },
    {
      degree: "Business Analysis and Process Management",
      institution: "Certified",
    },
    {
      degree: "Accounting and Payroll Administration Diploma with Distinction",
      institution: "GPA 4.0, 97%",
    },
    {
      degree: "Oracle Certified Professional (SQL, Oracle 10g)",
      institution: "Oracle",
    },
    {
      degree: "BSc Economics",
      institution: "University",
    },
  ],
  keyProjects: [
    {
      name: "ADP Payroll System Implementation",
      description:
        "Led the implementation of ADP payroll system across unionized and non-unionized employee groups at Joseph Brant Hospital",
      technologies: ["ADP Global View", "Data Migration", "System Configuration", "UAT Testing"],
      impact:
        "Successful deployment ensuring accurate payroll processing for all employee categories",
    },
    {
      name: "Payroll Process Automation at RBC",
      description:
        "Participated in migrating manual payroll requests to robotic automation for 60,000+ employees",
      technologies: ["SAP", "Service Now", "RPA", "Process Documentation"],
      impact:
        "Improved efficiency and accuracy of payroll processing, reduced manual intervention",
    },
    {
      name: "Multi-Union Payroll Management",
      description:
        "Managed complex payroll calculations for multiple union contracts ensuring compliance with varied collective agreements",
      technologies: ["Kronos", "Union Contract Interpretation", "Compliance Reporting"],
      impact:
        "100% compliance with union agreements, accurate processing for 1000+ employees",
    },
  ],
};

// ============================================
// CANDIDATE REGISTRY
// ============================================

export const candidates: Record<string, CandidateData> = {
  "johnson-ojo": johnsonOjoData,
  "ade-ojo": adeOjoData,
};

export const candidateList = Object.values(candidates);

// Default candidate (for backward compatibility)
export const candidateData = johnsonOjoData;

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getCandidateById = (id: string): CandidateData | undefined => {
  return candidates[id];
};

export const formatCandidateExperience = (candidate: CandidateData): string => {
  const { name, email, phone, location, linkedin, skills, experience, education, keyProjects } =
    candidate;

  let skillsText = "";

  if (isDeveloperCandidate(candidate)) {
    skillsText = `
- Languages: ${candidate.skills.languages}
- Frameworks/Libraries: ${candidate.skills.frameworks_libraries}
- Architecture: ${candidate.skills.architecture}
- CSS: ${candidate.skills.css}
- Tools: ${candidate.skills.tools}
- Testing: ${candidate.skills.testing}
- Methodologies: ${candidate.skills.methodologies}
- Design: ${candidate.skills.design}
- Other: ${candidate.skills.other}`;
  } else if (isPayrollCandidate(candidate)) {
    skillsText = `
- Payroll Systems: ${candidate.skills.payroll_systems}
- HRIS Applications: ${candidate.skills.hris_applications}
- Legislative Knowledge: ${candidate.skills.legislative_knowledge}
- Software Tools: ${candidate.skills.software_tools}
- Methodologies: ${candidate.skills.methodologies}
- Certifications: ${candidate.skills.certifications}`;
  }

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

  const professionalSummary =
    candidate.professionType === "developer"
      ? `A proficient Front-End Developer with ${candidate.yearsOfExperience} years of experience in building high-performance, scalable web applications. Skilled in modern web technologies including JavaScript, TypeScript, Redux, React, NextJS, and HTML/CSS, with a strong focus on creating responsive and user-friendly interfaces. Experienced in agile methodologies and cross-functional teamwork, consistently delivering projects with a keen eye for detail and maintainability.`
      : `Dynamic and experienced Senior Payroll Specialist and supervisor with over ${candidate.yearsOfExperience} years of expertise in managing and implementing global payroll systems. Proven leadership in overseeing complex technical payroll projects, enhancing system functionalities, and ensuring compliance with various regulations. Adept at collaborating with cross-functional teams, optimizing processes through data analytics, and maintaining adherence to best practices in payroll management.`;

  const highlightsText =
    candidate.professionType === "developer"
      ? `- Knowledge of Agile development methodologies demonstrating deep understanding of iterative development, continuous integration, and collaborative project management
- Extensive knowledge in advanced React concepts, JavaScript, HTML5, and CSS, showcasing expertise in building sophisticated, dynamic web interfaces and single-page applications
- In-depth understanding of web standards, including cross-browser compatibility, progressive enhancement, graceful degradation, and responsive design
- Deep understanding of REST principles with substantial experience in working with and implementing backend APIs
- Mastery in foundations of the web, including vanilla JavaScript, HTML, and CSS3, ensuring robust and efficient coding practices
- Proven track record of mentoring junior developers and leading cross-functional teams in enterprise environments`
      : `- Strong understanding of payroll and human resources operations, benefits, compensation, and pension policies
- Demonstrated capability as a Payroll Systems Lead in overseeing major global payroll implementations, ensuring successful deployment and efficient operation across different geographical locations
- Legislative Knowledge relevant to payroll including Income Tax Act, Employment Insurance Act, Canada Pension Plan Act, Employment and Labour Standards Acts, Provincial Income Tax Acts, and Workers' Compensation Legislation, HOOPP, OMERS
- Excellent project planning skills and the ability to manage complex conflicting priorities
- Ability to exercise sound judgement, maintain appropriate internal controls and interpret payroll rules
- Strong communication and interpersonal skills and working effectively with senior management and Leadership staff at all levels
- Strong customer service, problem solving, organizational, planning, communication, analytical and negotiation skills`;

  return `**Name:** ${name}
**Contact:** ${email} | ${phone} | ${location}${linkedin ? ` | ${linkedin}` : ""}

**Professional Summary:**
${professionalSummary}

**Highlights of Qualifications:**
${highlightsText}

**Skills:**
${skillsText}

**Key Projects:**
${keyProjectsText}

**Experience:**

${experienceText}

**Education:**
${educationText}`;
};

// Legacy export for backward compatibility
export { isDeveloperCandidate, isPayrollCandidate };
