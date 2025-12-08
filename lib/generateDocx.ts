import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopPosition,
  TabStopType,
  Packer,
} from "docx";
import { TailoredResume, CandidateData, isDeveloperCandidate } from "./types";
import { candidateData as defaultCandidate } from "./candidateData";

const FONT_FAMILY = "Calibri";
const NAME_SIZE = 40;        // 20pt - Name at top
const HEADING_SIZE = 24;     // 12pt - Section headings (PROFESSIONAL SUMMARY, SKILLS, etc.)
const SUBHEADING_SIZE = 22;  // 11pt - Company names
const BODY_SIZE = 22;        // 11pt - Body text and bullets
const CONTACT_SIZE = 20;     // 10pt - Contact info

export const generateResumeDocx = async (
  resume: TailoredResume,
  candidate: CandidateData = defaultCandidate
): Promise<Blob> => {
  const { name, email, phone, location, linkedin } = candidate;
  
  // Build contact string
  const contactParts = [email, phone, location];
  if (linkedin) contactParts.push(linkedin);
  const contactString = contactParts.join(" | ");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Header - Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: name,
                bold: true,
                size: NAME_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Contact Information
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: contactString,
                size: CONTACT_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Professional Summary Section
          createSectionHeading("PROFESSIONAL SUMMARY"),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: resume.professional_summary,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Highlights of Qualifications Section
          ...(resume.highlights_of_qualifications && resume.highlights_of_qualifications.length > 0
            ? [
                createSectionHeading("HIGHLIGHTS OF QUALIFICATIONS"),
                ...createHighlightsSection(resume.highlights_of_qualifications),
              ]
            : []),

          // Skills Section
          createSectionHeading("SKILLS"),
          ...createSkillsSection(resume.skills, candidate),

          // Key Projects Section
          ...(resume.key_projects && resume.key_projects.length > 0
            ? [
                createSectionHeading("KEY PROJECTS"),
                ...createKeyProjectsSection(resume.key_projects),
              ]
            : []),

          // Experience Section
          createSectionHeading("PROFESSIONAL EXPERIENCE"),
          ...createExperienceSection(resume.experience),

          // Education Section
          createSectionHeading("EDUCATION"),
          ...createEducationSection(resume.education),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};

const createSectionHeading = (title: string): Paragraph => {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    border: {
      bottom: {
        color: "000000",
        space: 1,
        size: 6,
        style: "single",
      },
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: HEADING_SIZE,
        font: FONT_FAMILY,
      }),
    ],
  });
};

const createHighlightsSection = (highlights: string[]): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  highlights.forEach((highlight) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 60 },
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: highlight,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );
  });

  paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  return paragraphs;
};

const createSkillsSection = (
  skills: TailoredResume["skills"],
  candidate: CandidateData
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  const skillCategories = getSkillCategories(skills, candidate);

  skillCategories.forEach((category) => {
    if (category.items && category.items.length > 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: `${category.label}: `,
              bold: true,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
            new TextRun({
              text: category.items.join(", "),
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }
  });

  paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  return paragraphs;
};

const createExperienceSection = (
  experiences: TailoredResume["experience"]
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  experiences.forEach((exp, index) => {
    // Company and Location line
    paragraphs.push(
      new Paragraph({
        spacing: { before: index > 0 ? 200 : 0, after: 40 },
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        children: [
          new TextRun({
            text: exp.company,
            bold: true,
            size: SUBHEADING_SIZE,
            font: FONT_FAMILY,
          }),
          new TextRun({
            text: ` — ${exp.location}`,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Role and Dates line
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        children: [
          new TextRun({
            text: exp.role,
            italics: true,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
          new TextRun({
            text: "\t",
          }),
          new TextRun({
            text: exp.dates,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Summary
    if (exp.summary) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: exp.summary,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    // Achievements
    exp.achievements.forEach((achievement) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: achievement,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    });
  });

  paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  return paragraphs;
};

const createKeyProjectsSection = (
  projects: NonNullable<TailoredResume["key_projects"]>
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  projects.forEach((project) => {
    // Project Name
    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: project.name,
            bold: true,
            size: SUBHEADING_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Description
    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: project.description,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Technologies
    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: "Technologies: ",
            bold: true,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
          new TextRun({
            text: project.technologies.join(", "),
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    // Impact (if exists)
    if (project.impact) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "Impact: ",
              bold: true,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
            new TextRun({
              text: project.impact,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }
  });

  paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return paragraphs;
};

const createEducationSection = (
  education: TailoredResume["education"]
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  education.forEach((edu) => {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: edu.degree,
            bold: true,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
          new TextRun({
            text: ` — ${edu.institution}`,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
          ...(edu.location
            ? [
                new TextRun({
                  text: `, ${edu.location}`,
                  size: BODY_SIZE,
                  font: FONT_FAMILY,
                }),
              ]
            : []),
        ],
      })
    );
  });

  return paragraphs;
};

// ============================================
// HELPER FUNCTION FOR SKILL CATEGORIES
// ============================================

interface SkillCategory {
  label: string;
  items: string[] | undefined;
}

const getSkillCategories = (
  skills: TailoredResume["skills"],
  candidate: CandidateData
): SkillCategory[] => {
  if (isDeveloperCandidate(candidate)) {
    return [
      { label: "Languages", items: skills.languages },
      { label: "Frameworks & Libraries", items: skills.frameworks_libraries },
      { label: "Architecture", items: skills.architecture },
      { label: "Tools & Platforms", items: skills.tools_platforms },
      { label: "Methodologies", items: skills.methodologies },
    ];
  }

  // Payroll candidate
  return [
    { label: "Payroll Systems", items: skills.payroll_systems },
    { label: "HRIS Applications", items: skills.hris_applications },
    { label: "Legislative Knowledge", items: skills.legislative_knowledge },
    { label: "Software Tools", items: skills.software_tools },
    { label: "Methodologies", items: skills.methodologies },
  ];
};
