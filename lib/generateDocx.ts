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
import { TailoredResume } from "./types";
import { candidateData } from "./candidateData";

const FONT_FAMILY = "Calibri";
const HEADING_SIZE = 28;
const SUBHEADING_SIZE = 24;
const BODY_SIZE = 22;
const CONTACT_SIZE = 20;

export const generateResumeDocx = async (
  resume: TailoredResume
): Promise<Blob> => {
  const { name, email, phone, location, linkedin } = candidateData;

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
                size: 36,
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
                text: `${email} | ${phone} | ${location} | ${linkedin}`,
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

          // Skills Section
          createSectionHeading("SKILLS"),
          ...createSkillsSection(resume.skills),

          // Experience Section
          createSectionHeading("EXPERIENCE"),
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

const createSkillsSection = (skills: TailoredResume["skills"]): Paragraph[] => {
  const paragraphs: Paragraph[] = [];

  const skillCategories = [
    { label: "Languages", items: skills.languages },
    { label: "Frameworks & Libraries", items: skills.frameworks_libraries },
    { label: "Architecture", items: skills.architecture },
    { label: "Tools & Platforms", items: skills.tools_platforms },
    { label: "Methodologies", items: skills.methodologies },
  ];

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

