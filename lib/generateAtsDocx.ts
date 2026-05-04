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
import { DynamicATSResume } from "./types";

const FONT = "Calibri";
const SIZE = {
  name: 40,
  title: 24,
  heading: 24,
  sub: 22,
  body: 22,
  contact: 20,
};

const sectionHeading = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { color: "000000", space: 1, size: 6, style: "single" },
    },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: SIZE.heading, font: FONT }),
    ],
  });

const bullet = (text: string, prefix = "•"): Paragraph =>
  new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${prefix}  ${text}`, size: SIZE.body, font: FONT }),
    ],
  });

export const generateDynamicATSDocx = async (
  resume: DynamicATSResume
): Promise<Blob> => {
  const c = resume.contact;
  const contactParts = [c.email, c.phone, c.location, c.linkedin].filter(
    Boolean
  );

  const children: Paragraph[] = [];

  // Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: c.name, bold: true, size: SIZE.name, font: FONT }),
      ],
    })
  );

  // Target title
  if (resume.target_job_title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: resume.target_job_title,
            bold: true,
            size: SIZE.title,
            font: FONT,
          }),
        ],
      })
    );
  }

  // Contact line
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: SIZE.contact,
            font: FONT,
          }),
        ],
      })
    );
  }

  // Professional Summary
  children.push(sectionHeading("Professional Summary"));
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: resume.professional_summary,
          size: SIZE.body,
          font: FONT,
        }),
      ],
    })
  );

  // Highlights
  if (resume.highlights?.length) {
    children.push(sectionHeading("Highlights of Qualifications"));
    resume.highlights.forEach((h) => {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `\u2713  ${h}`, size: SIZE.body, font: FONT }),
          ],
        })
      );
    });
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  // Skills
  if (resume.skills?.length) {
    children.push(sectionHeading("Skills"));
    resume.skills.forEach((group) => {
      if (group.items?.length) {
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `${group.label}: `,
                bold: true,
                size: SIZE.body,
                font: FONT,
              }),
              new TextRun({
                text: group.items.join(", "),
                size: SIZE.body,
                font: FONT,
              }),
            ],
          })
        );
      }
    });
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  // Experience
  if (resume.experience?.length) {
    children.push(sectionHeading("Professional Experience"));
    resume.experience.forEach((exp, idx) => {
      // Company + location
      children.push(
        new Paragraph({
          spacing: { before: idx > 0 ? 200 : 0, after: 40 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: SIZE.sub,
              font: FONT,
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: ` \u2014 ${exp.location}`,
                    size: SIZE.body,
                    font: FONT,
                  }),
                ]
              : []),
          ],
        })
      );
      // Role + dates
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({
              text: exp.role,
              italics: true,
              size: SIZE.body,
              font: FONT,
            }),
            new TextRun({ text: "\t" }),
            new TextRun({ text: exp.dates, size: SIZE.body, font: FONT }),
          ],
        })
      );
      // Achievements
      exp.achievements.forEach((a) => {
        children.push(bullet(a));
      });
    });
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  // Education
  if (resume.education?.length) {
    children.push(sectionHeading("Education"));
    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: SIZE.body,
              font: FONT,
            }),
            new TextRun({
              text: ` \u2014 ${edu.institution}${edu.location ? `, ${edu.location}` : ""}`,
              size: SIZE.body,
              font: FONT,
            }),
          ],
        })
      );
    });
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }

  // Professional Designations
  if (resume.professional_designations?.length) {
    children.push(sectionHeading("Professional Designations"));
    resume.professional_designations.forEach((pd) => {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: pd.degree,
              bold: true,
              size: SIZE.body,
              font: FONT,
            }),
            new TextRun({
              text: ` \u2014 ${pd.institution}${pd.location ? `, ${pd.location}` : ""}`,
              size: SIZE.body,
              font: FONT,
            }),
          ],
        })
      );
    });
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  }


  // Additional sections
  resume.additional_sections?.forEach((sec) => {
    children.push(sectionHeading(sec.heading));
    sec.bullets.forEach((b) => children.push(bullet(b)));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};
