import { jsPDF } from "jspdf";
import { TailoredResume, CandidateData, isDeveloperCandidate } from "./types";
import { candidateData as defaultCandidate } from "./candidateData";

const FONT_SIZE = {
  name: 18,
  heading: 12,
  subheading: 11,
  body: 10,
  small: 9,
};

const COLORS = {
  black: "#000000",
  gray: "#4a5568",
  lightGray: "#718096",
};

const MARGIN = {
  left: 20,
  right: 20,
  top: 20,
};

const PAGE_WIDTH = 210; // A4 width in mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.left - MARGIN.right;

export const generateResumePdf = (
  resume: TailoredResume,
  candidate: CandidateData = defaultCandidate
): Blob => {
  const { name, email, phone, location, linkedin } = candidate;
  const doc = new jsPDF();

  let yPos = MARGIN.top;

  // Helper function to check and add new page if needed
  const checkNewPage = (requiredSpace: number = 15) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = MARGIN.top;
    }
  };

  // Helper function to add wrapped text
  const addWrappedText = (
    text: string,
    fontSize: number,
    color: string = COLORS.black,
    isBold: boolean = false,
    maxWidth: number = CONTENT_WIDTH
  ): number => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      checkNewPage(lineHeight);
      doc.text(line, MARGIN.left, yPos);
      yPos += lineHeight;
    });
    
    return lines.length * lineHeight;
  };

  // Helper function to add a section heading
  const addSectionHeading = (title: string) => {
    checkNewPage(15);
    yPos += 4;
    doc.setFontSize(FONT_SIZE.heading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black);
    doc.text(title.toUpperCase(), MARGIN.left, yPos);
    yPos += 2;
    
    // Add underline
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(MARGIN.left, yPos, PAGE_WIDTH - MARGIN.right, yPos);
    yPos += 6;
  };

  // Header - Name (centered)
  doc.setFontSize(FONT_SIZE.name);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.black);
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (PAGE_WIDTH - nameWidth) / 2, yPos);
  yPos += 8;

  // Contact Info (centered)
  doc.setFontSize(FONT_SIZE.small);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.gray);
  const contactParts = [email, phone, location];
  if (linkedin) contactParts.push(linkedin);
  const contactText = contactParts.join(" | ");
  const contactWidth = doc.getTextWidth(contactText);
  doc.text(contactText, (PAGE_WIDTH - contactWidth) / 2, yPos);
  yPos += 10;

  // Professional Summary
  addSectionHeading("Professional Summary");
  addWrappedText(resume.professional_summary, FONT_SIZE.body, COLORS.black);
  yPos += 2;

  // Highlights of Qualifications
  if (resume.highlights_of_qualifications && resume.highlights_of_qualifications.length > 0) {
    addSectionHeading("Highlights of Qualifications");
    resume.highlights_of_qualifications.forEach((highlight) => {
      checkNewPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black);
      
      // Add checkmark
      doc.text("✓", MARGIN.left, yPos);
      
      // Add wrapped text for highlight
      const highlightLines = doc.splitTextToSize(highlight, CONTENT_WIDTH - 8);
      highlightLines.forEach((line: string, idx: number) => {
        if (idx === 0) {
          doc.text(line, MARGIN.left + 6, yPos);
        } else {
          yPos += 4;
          doc.text(line, MARGIN.left + 6, yPos);
        }
      });
      yPos += 5;
    });
    yPos += 2;
  }

  // Skills Section - Dynamic based on candidate type
  addSectionHeading("Skills");
  
  const skillCategories = getSkillCategories(resume, candidate);

  skillCategories.forEach((category) => {
    if (category.items && category.items.length > 0) {
      checkNewPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "bold");
      doc.text(`${category.label}: `, MARGIN.left, yPos);
      const labelWidth = doc.getTextWidth(`${category.label}: `);
      
      doc.setFont("helvetica", "normal");
      const skillsText = category.items.join(", ");
      const skillsLines = doc.splitTextToSize(skillsText, CONTENT_WIDTH - labelWidth);
      
      skillsLines.forEach((line: string, idx: number) => {
        if (idx === 0) {
          doc.text(line, MARGIN.left + labelWidth, yPos);
        } else {
          yPos += 4;
          doc.text(line, MARGIN.left, yPos);
        }
      });
      yPos += 5;
    }
  });
  yPos += 2;

  // Key Projects
  if (resume.key_projects && resume.key_projects.length > 0) {
    addSectionHeading("Key Projects");
    
    resume.key_projects.forEach((project) => {
      checkNewPage(20);
      
      // Project Name
      doc.setFontSize(FONT_SIZE.subheading);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.black);
      doc.text(project.name, MARGIN.left, yPos);
      yPos += 5;
      
      // Description
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(project.description, CONTENT_WIDTH);
      descLines.forEach((line: string) => {
        checkNewPage(4);
        doc.text(line, MARGIN.left, yPos);
        yPos += 4;
      });
      yPos += 1;
      
      // Technologies
      doc.setFont("helvetica", "bold");
      doc.text("Technologies: ", MARGIN.left, yPos);
      const techLabelWidth = doc.getTextWidth("Technologies: ");
      doc.setFont("helvetica", "normal");
      doc.text(project.technologies.join(", "), MARGIN.left + techLabelWidth, yPos);
      yPos += 4;
      
      // Impact
      if (project.impact) {
        doc.setFont("helvetica", "bold");
        doc.text("Impact: ", MARGIN.left, yPos);
        const impactLabelWidth = doc.getTextWidth("Impact: ");
        doc.setFont("helvetica", "normal");
        doc.text(project.impact, MARGIN.left + impactLabelWidth, yPos);
        yPos += 4;
      }
      yPos += 3;
    });
    yPos += 2;
  }

  // Professional Experience
  addSectionHeading("Professional Experience");
  
  resume.experience.forEach((exp, expIndex) => {
    checkNewPage(20);
    
    // Company and Location
    doc.setFontSize(FONT_SIZE.subheading);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black);
    doc.text(`${exp.company}`, MARGIN.left, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.gray);
    const companyWidth = doc.getTextWidth(`${exp.company} `);
    doc.text(`— ${exp.location}`, MARGIN.left + companyWidth, yPos);
    yPos += 5;

    // Role and Dates
    doc.setFontSize(FONT_SIZE.body);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(COLORS.black);
    doc.text(exp.role, MARGIN.left, yPos);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.gray);
    const datesWidth = doc.getTextWidth(exp.dates);
    doc.text(exp.dates, PAGE_WIDTH - MARGIN.right - datesWidth, yPos);
    yPos += 5;

    // Summary (if exists)
    if (exp.summary) {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black);
      addWrappedText(exp.summary, FONT_SIZE.body);
      yPos += 2;
    }

    // Achievements
    exp.achievements.forEach((achievement) => {
      checkNewPage(8);
      doc.setFontSize(FONT_SIZE.body);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black);
      
      // Bullet point
      doc.text("•", MARGIN.left, yPos);
      
      // Achievement text (wrapped)
      const achievementLines = doc.splitTextToSize(achievement, CONTENT_WIDTH - 6);
      achievementLines.forEach((line: string, idx: number) => {
        if (idx === 0) {
          doc.text(line, MARGIN.left + 5, yPos);
        } else {
          yPos += 4;
          checkNewPage(4);
          doc.text(line, MARGIN.left + 5, yPos);
        }
      });
      yPos += 5;
    });

    if (expIndex < resume.experience.length - 1) {
      yPos += 3;
    }
  });

  // Education
  addSectionHeading("Education");
  
  resume.education.forEach((edu) => {
    checkNewPage(8);
    doc.setFontSize(FONT_SIZE.body);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.black);
    doc.text(edu.degree, MARGIN.left, yPos);
    
    const degreeWidth = doc.getTextWidth(edu.degree + " ");
    doc.setFont("helvetica", "normal");
    doc.text(`— ${edu.institution}${edu.location ? `, ${edu.location}` : ""}`, MARGIN.left + degreeWidth, yPos);
    yPos += 5;
  });

  // Return as blob
  return doc.output("blob");
};

// ============================================
// HELPER FUNCTION FOR SKILL CATEGORIES
// ============================================

interface SkillCategory {
  label: string;
  items: string[] | undefined;
}

const getSkillCategories = (
  resume: TailoredResume,
  candidate: CandidateData
): SkillCategory[] => {
  if (isDeveloperCandidate(candidate)) {
    return [
      { label: "Languages", items: resume.skills.languages },
      { label: "Frameworks & Libraries", items: resume.skills.frameworks_libraries },
      { label: "Architecture", items: resume.skills.architecture },
      { label: "Tools & Platforms", items: resume.skills.tools_platforms },
      { label: "Methodologies", items: resume.skills.methodologies },
    ];
  }

  // Payroll candidate
  return [
    { label: "Payroll Systems", items: resume.skills.payroll_systems },
    { label: "HRIS Applications", items: resume.skills.hris_applications },
    { label: "Legislative Knowledge", items: resume.skills.legislative_knowledge },
    { label: "Software Tools", items: resume.skills.software_tools },
    { label: "Methodologies", items: resume.skills.methodologies },
  ];
};
