import { Document, Paragraph, TextRun, AlignmentType, Packer } from "docx";
import { CoverLetterParagraphs } from "@/app/api/generate-cover-letter/route";
import { CandidateData } from "./types";
import { candidateData as defaultCandidate } from "./candidateData";

const FONT_FAMILY = "Calibri";
const NAME_SIZE = 32; // 16pt
const CONTACT_SIZE = 20; // 10pt
const BODY_SIZE = 22; // 11pt

export const generateCoverLetterDocx = async (
  coverLetter: CoverLetterParagraphs,
  companyName: string,
  candidate: CandidateData = defaultCandidate
): Promise<Blob> => {
  const { name, email, phone, location, linkedin } = candidate;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build contact paragraphs
  const contactParagraphs = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `${email} | ${phone} | ${location}`,
          size: CONTACT_SIZE,
          font: FONT_FAMILY,
          color: "666666",
        }),
      ],
    }),
  ];

  // Only add LinkedIn paragraph if available
  if (linkedin) {
    contactParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: linkedin,
            size: CONTACT_SIZE,
            font: FONT_FAMILY,
            color: "666666",
          }),
        ],
      })
    );
  } else {
    // Add spacing after contact info
    contactParagraphs[0] = new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${email} | ${phone} | ${location}`,
          size: CONTACT_SIZE,
          font: FONT_FAMILY,
          color: "666666",
        }),
      ],
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header - Name
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: name,
                bold: true,
                size: NAME_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Contact Info
          ...contactParagraphs,

          // Date
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: today,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Greeting
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: coverLetter.greeting,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Opening Paragraph
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: coverLetter.opening_paragraph,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Body Paragraph 1
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: coverLetter.body_paragraph_1,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Body Paragraph 2
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: coverLetter.body_paragraph_2,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Closing Paragraph
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: coverLetter.closing_paragraph,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Signature - Sincerely
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Sincerely,",
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Signature - Name
          new Paragraph({
            spacing: { after: 0 },
            children: [
              new TextRun({
                text: name,
                bold: true,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
