import { jsPDF } from "jspdf";
import { DynamicATSResume } from "./types";

const FONT_SIZE = { name: 18, title: 13, heading: 12, sub: 11, body: 10, small: 9 };
const COLORS = { black: "#000000", gray: "#4a5568" };
const MARGIN = { left: 20, right: 20, top: 20 };
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;

export const generateDynamicATSPdf = (resume: DynamicATSResume): Blob => {
  const doc = new jsPDF();
  let y = MARGIN.top;

  const checkPage = (needed = 15) => {
    if (y + needed > 280) {
      doc.addPage();
      y = MARGIN.top;
    }
  };

  const addWrapped = (
    text: string,
    size: number,
    color = COLORS.black,
    bold = false,
    maxW = CONTENT_WIDTH
  ) => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxW);
    const lh = size * 0.5;
    lines.forEach((line: string) => {
      checkPage(lh);
      doc.text(line, MARGIN.left, y);
      y += lh;
    });
    return lines.length * lh;
  };

  const addHeading = (title: string) => {
    checkPage(15);
    y += 4;
    doc.setFontSize(FONT_SIZE.heading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black);
    doc.text(title.toUpperCase(), MARGIN.left, y);
    y += 2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(MARGIN.left, y, PAGE_WIDTH - MARGIN.right, y);
    y += 6;
  };

  const c = resume.contact;
  const contactParts = [c.email, c.phone, c.location, c.linkedin].filter(Boolean);

  // Name
  doc.setFontSize(FONT_SIZE.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  const nameW = doc.getTextWidth(c.name);
  doc.text(c.name, (PAGE_WIDTH - nameW) / 2, y);
  y += 7;

  // Target title
  if (resume.target_job_title) {
    doc.setFontSize(FONT_SIZE.title);
    doc.setFont("helvetica", "bold");
    const titleW = doc.getTextWidth(resume.target_job_title);
    doc.text(resume.target_job_title, (PAGE_WIDTH - titleW) / 2, y);
    y += 6;
  }

  // Contact
  if (contactParts.length > 0) {
    doc.setFontSize(FONT_SIZE.small);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.gray);
    const contactText = contactParts.join(" | ");
    const contactW = doc.getTextWidth(contactText);
    doc.text(contactText, (PAGE_WIDTH - contactW) / 2, y);
    y += 10;
  }

  // Professional Summary
  addHeading("Professional Summary");
  addWrapped(resume.professional_summary, FONT_SIZE.body);
  y += 2;

  // Highlights
  if (resume.highlights?.length) {
    addHeading("Highlights of Qualifications");
    resume.highlights.forEach((h) => {
      checkPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black);
      doc.text("\u2713", MARGIN.left, y);
      const lines = doc.splitTextToSize(h, CONTENT_WIDTH - 8);
      lines.forEach((line: string, i: number) => {
        if (i > 0) { y += 4; }
        doc.text(line, MARGIN.left + 6, y);
      });
      y += 5;
    });
    y += 2;
  }

  // Skills
  if (resume.skills?.length) {
    addHeading("Skills");
    resume.skills.forEach((group) => {
      if (!group.items?.length) return;
      checkPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black);
      doc.text(`${group.label}: `, MARGIN.left, y);
      const labelW = doc.getTextWidth(`${group.label}: `);
      doc.setFont("helvetica", "normal");
      const skillText = group.items.join(", ");
      const skillLines = doc.splitTextToSize(skillText, CONTENT_WIDTH - labelW);
      skillLines.forEach((line: string, i: number) => {
        if (i === 0) { doc.text(line, MARGIN.left + labelW, y); }
        else { y += 4; doc.text(line, MARGIN.left, y); }
      });
      y += 5;
    });
    y += 2;
  }

  // Experience
  if (resume.experience?.length) {
    addHeading("Professional Experience");
    resume.experience.forEach((exp) => {
      checkPage(20);
      // Company
      doc.setFontSize(FONT_SIZE.sub);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black);
      doc.text(exp.company, MARGIN.left, y);
      if (exp.location) {
        const compW = doc.getTextWidth(`${exp.company} `);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.gray);
        doc.text(`\u2014 ${exp.location}`, MARGIN.left + compW, y);
      }
      y += 5;
      // Role + dates
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(COLORS.black);
      doc.text(exp.role, MARGIN.left, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.gray);
      const datesW = doc.getTextWidth(exp.dates);
      doc.text(exp.dates, PAGE_WIDTH - MARGIN.right - datesW, y);
      y += 5;
      // Achievements
      exp.achievements.forEach((a) => {
        checkPage(8);
        doc.setFontSize(FONT_SIZE.body);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.black);
        doc.text("\u2022", MARGIN.left, y);
        const lines = doc.splitTextToSize(a, CONTENT_WIDTH - 6);
        lines.forEach((line: string, i: number) => {
          if (i > 0) { y += 4; }
          doc.text(line, MARGIN.left + 5, y);
        });
        y += 5;
      });
      y += 3;
    });
  }

  // Education
  if (resume.education?.length) {
    addHeading("Education");
    resume.education.forEach((edu) => {
      checkPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black);
      doc.text(edu.degree, MARGIN.left, y);
      const degW = doc.getTextWidth(`${edu.degree} \u2014 `);
      doc.setFont("helvetica", "normal");
      const instText = `\u2014 ${edu.institution}${edu.location ? `, ${edu.location}` : ""}`;
      doc.text(instText, MARGIN.left + degW, y);
      y += 5;
    });
    y += 2;
  }

  // Additional sections
  resume.additional_sections?.forEach((sec) => {
    addHeading(sec.heading);
    sec.bullets.forEach((b) => {
      checkPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black);
      doc.text("\u2022", MARGIN.left, y);
      const lines = doc.splitTextToSize(b, CONTENT_WIDTH - 6);
      lines.forEach((line: string, i: number) => {
        if (i > 0) { y += 4; }
        doc.text(line, MARGIN.left + 5, y);
      });
      y += 5;
    });
    y += 2;
  });

  return doc.output("blob");
};
