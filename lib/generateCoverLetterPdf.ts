import { jsPDF } from "jspdf";
import { CoverLetterParagraphs } from "@/app/api/generate-cover-letter/route";
import { candidateData } from "./candidateData";

const FONT_SIZE = {
  name: 16,
  contact: 10,
  body: 11,
};

const COLORS = {
  black: "#000000",
  gray: "#666666",
};

const MARGIN = {
  left: 25,
  right: 25,
  top: 25,
};

const PAGE_WIDTH = 210; // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;

export const generateCoverLetterPdf = (
  coverLetter: CoverLetterParagraphs,
  companyName: string
): Blob => {
  const { name, email, phone, location, linkedin } = candidateData;
  const doc = new jsPDF();

  let yPos = MARGIN.top;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper function to add wrapped text
  const addWrappedText = (
    text: string,
    fontSize: number,
    color: string = COLORS.black,
    isBold: boolean = false
  ): void => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      if (yPos + lineHeight > 280) {
        doc.addPage();
        yPos = MARGIN.top;
      }
      doc.text(line, MARGIN.left, yPos);
      yPos += lineHeight;
    });
  };

  // Header - Name
  doc.setFontSize(FONT_SIZE.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  doc.text(name, MARGIN.left, yPos);
  yPos += 7;

  // Contact Info
  doc.setFontSize(FONT_SIZE.contact);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  doc.text(`${email} | ${phone} | ${location}`, MARGIN.left, yPos);
  yPos += 5;
  doc.text(linkedin, MARGIN.left, yPos);
  yPos += 15;

  // Date
  doc.setFontSize(FONT_SIZE.body);
  doc.setTextColor(COLORS.black);
  doc.text(today, MARGIN.left, yPos);
  yPos += 12;

  // Greeting
  addWrappedText(coverLetter.greeting, FONT_SIZE.body);
  yPos += 6;

  // Opening Paragraph
  addWrappedText(coverLetter.opening_paragraph, FONT_SIZE.body);
  yPos += 6;

  // Body Paragraph 1
  addWrappedText(coverLetter.body_paragraph_1, FONT_SIZE.body);
  yPos += 6;

  // Body Paragraph 2
  addWrappedText(coverLetter.body_paragraph_2, FONT_SIZE.body);
  yPos += 6;

  // Closing Paragraph
  addWrappedText(coverLetter.closing_paragraph, FONT_SIZE.body);
  yPos += 10;

  // Signature
  doc.setFont("helvetica", "normal");
  doc.text("Sincerely,", MARGIN.left, yPos);
  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.text(name, MARGIN.left, yPos);

  // Return as blob
  return doc.output("blob");
};

