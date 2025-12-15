"use client";

import { useState } from "react";
import {
  ResumeResponse,
  CandidateData,
  isDeveloperCandidate,
} from "@/lib/types";
import { generateResumeDocx } from "@/lib/generateDocx";
import { generateResumePdf } from "@/lib/generatePdf";
import { saveAs } from "file-saver";
import { candidateData as defaultCandidate } from "@/lib/candidateData";

interface ResumePreviewProps {
  data: ResumeResponse;
  onReset: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  candidate?: CandidateData;
  onRegenerateWithKeywords?: (keywords: string[]) => void;
  isRegenerating?: boolean;
}

const ResumePreview = ({
  data,
  onReset,
  onToast,
  candidate = defaultCandidate,
  onRegenerateWithKeywords,
  isRegenerating = false,
}: ResumePreviewProps) => {
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "optimization">(
    "preview"
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set()
  );

  const { tailored_resume, optimization_notes } = data;

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const blob = await generateResumeDocx(tailored_resume, candidate);
      const fileName = `${candidate.name
        .replace(/\s+/g, "_")
        .replace(/\(.*?\)/g, "")}_Resume_${
        new Date().toISOString().split("T")[0]
      }.docx`;
      saveAs(blob, fileName);
      onToast?.("Word document downloaded!", "success");
    } catch (error) {
      console.error("Error generating document:", error);
      onToast?.("Failed to generate document. Please try again.", "error");
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = generateResumePdf(tailored_resume, candidate);
      const fileName = `${candidate.name
        .replace(/\s+/g, "_")
        .replace(/\(.*?\)/g, "")}_Resume_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      saveAs(blob, fileName);
      onToast?.("PDF downloaded!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      onToast?.("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopySection = async (sectionName: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionName);
      onToast?.(`${sectionName} copied to clipboard!`, "success");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      onToast?.("Failed to copy to clipboard", "error");
    }
  };

  const handleCopyAll = async () => {
    const fullResume = formatResumeAsText();
    try {
      await navigator.clipboard.writeText(fullResume);
      onToast?.("Full resume copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy:", error);
      onToast?.("Failed to copy to clipboard", "error");
    }
  };

  const formatResumeAsText = (): string => {
    const {
      professional_summary,
      highlights_of_qualifications,
      skills,
      experience,
      education,
    } = tailored_resume;

    const contactParts = [candidate.email, candidate.phone, candidate.location];
    if (candidate.linkedin) contactParts.push(candidate.linkedin);

    let text = `${candidate.name}\n`;
    text += `${contactParts.join(" | ")}\n\n`;

    text += `PROFESSIONAL SUMMARY\n${professional_summary}\n\n`;

    if (highlights_of_qualifications?.length) {
      text += `HIGHLIGHTS OF QUALIFICATIONS\n`;
      highlights_of_qualifications.forEach((h) => {
        text += `✓ ${h}\n`;
      });
      text += `\n`;
    }

    text += `SKILLS\n`;
    // Developer skills
    if (skills.languages?.length)
      text += `Languages: ${skills.languages.join(", ")}\n`;
    if (skills.frameworks_libraries?.length)
      text += `Frameworks & Libraries: ${skills.frameworks_libraries.join(
        ", "
      )}\n`;
    if (skills.architecture?.length)
      text += `Architecture: ${skills.architecture.join(", ")}\n`;
    if (skills.tools_platforms?.length)
      text += `Tools & Platforms: ${skills.tools_platforms.join(", ")}\n`;
    // Payroll skills
    if (skills.payroll_systems?.length)
      text += `Payroll Systems: ${skills.payroll_systems.join(", ")}\n`;
    if (skills.hris_applications?.length)
      text += `HRIS Applications: ${skills.hris_applications.join(", ")}\n`;
    if (skills.legislative_knowledge?.length)
      text += `Legislative Knowledge: ${skills.legislative_knowledge.join(
        ", "
      )}\n`;
    if (skills.software_tools?.length)
      text += `Software Tools: ${skills.software_tools.join(", ")}\n`;
    // Common
    if (skills.methodologies?.length)
      text += `Methodologies: ${skills.methodologies.join(", ")}\n`;
    text += `\n`;

    text += `PROFESSIONAL EXPERIENCE\n`;
    experience.forEach((exp) => {
      text += `${exp.company} — ${exp.location}\n`;
      text += `${exp.role} | ${exp.dates}\n`;
      if (exp.summary) text += `${exp.summary}\n`;
      exp.achievements.forEach((a) => {
        text += `• ${a}\n`;
      });
      text += `\n`;
    });

    text += `EDUCATION\n`;
    education.forEach((edu) => {
      text += `${edu.degree} — ${edu.institution}${
        edu.location ? `, ${edu.location}` : ""
      }\n`;
    });

    return text;
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const getMatchScoreColor = (score: string) => {
    switch (score) {
      case "High":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Low":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Handle keyword selection toggle
  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  // Handle select all keywords
  const handleSelectAllKeywords = () => {
    if (optimization_notes.keywords_missing) {
      if (
        selectedKeywords.size === optimization_notes.keywords_missing.length
      ) {
        setSelectedKeywords(new Set());
      } else {
        setSelectedKeywords(new Set(optimization_notes.keywords_missing));
      }
    }
  };

  // Handle regenerate with selected keywords
  const handleRegenerateWithKeywords = () => {
    if (selectedKeywords.size > 0 && onRegenerateWithKeywords) {
      onRegenerateWithKeywords(Array.from(selectedKeywords));
    }
  };

  // Get skill categories based on what's in the response
  const getSkillsForCopy = () => {
    const parts = [];
    if (tailored_resume.skills.languages?.length)
      parts.push(`Languages: ${tailored_resume.skills.languages.join(", ")}`);
    if (tailored_resume.skills.frameworks_libraries?.length)
      parts.push(
        `Frameworks & Libraries: ${tailored_resume.skills.frameworks_libraries.join(
          ", "
        )}`
      );
    if (tailored_resume.skills.architecture?.length)
      parts.push(
        `Architecture: ${tailored_resume.skills.architecture.join(", ")}`
      );
    if (tailored_resume.skills.tools_platforms?.length)
      parts.push(
        `Tools & Platforms: ${tailored_resume.skills.tools_platforms.join(
          ", "
        )}`
      );
    if (tailored_resume.skills.payroll_systems?.length)
      parts.push(
        `Payroll Systems: ${tailored_resume.skills.payroll_systems.join(", ")}`
      );
    if (tailored_resume.skills.hris_applications?.length)
      parts.push(
        `HRIS Applications: ${tailored_resume.skills.hris_applications.join(
          ", "
        )}`
      );
    if (tailored_resume.skills.legislative_knowledge?.length)
      parts.push(
        `Legislative Knowledge: ${tailored_resume.skills.legislative_knowledge.join(
          ", "
        )}`
      );
    if (tailored_resume.skills.software_tools?.length)
      parts.push(
        `Software Tools: ${tailored_resume.skills.software_tools.join(", ")}`
      );
    if (tailored_resume.skills.methodologies?.length)
      parts.push(
        `Methodologies: ${tailored_resume.skills.methodologies.join(", ")}`
      );
    return parts.filter(Boolean).join("\n");
  };

  const CopyButton = ({
    section,
    content,
  }: {
    section: string;
    content: string;
  }) => (
    <button
      onClick={() => handleCopySection(section, content)}
      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
      aria-label={`Copy ${section}`}
      title={`Copy ${section}`}
    >
      {copiedSection === section ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );

  // Render skills based on candidate type
  const renderSkills = () => {
    const isDev = isDeveloperCandidate(candidate);

    if (isDev) {
      return (
        <>
          {tailored_resume.skills.languages &&
            tailored_resume.skills.languages.length > 0 && (
              <p className="text-slate-700">
                <span className="font-semibold">Languages:</span>{" "}
                {tailored_resume.skills.languages.join(", ")}
              </p>
            )}
          {tailored_resume.skills.frameworks_libraries &&
            tailored_resume.skills.frameworks_libraries.length > 0 && (
              <p className="text-slate-700">
                <span className="font-semibold">Frameworks & Libraries:</span>{" "}
                {tailored_resume.skills.frameworks_libraries.join(", ")}
              </p>
            )}
          {tailored_resume.skills.architecture &&
            tailored_resume.skills.architecture.length > 0 && (
              <p className="text-slate-700">
                <span className="font-semibold">Architecture:</span>{" "}
                {tailored_resume.skills.architecture.join(", ")}
              </p>
            )}
          {tailored_resume.skills.tools_platforms &&
            tailored_resume.skills.tools_platforms.length > 0 && (
              <p className="text-slate-700">
                <span className="font-semibold">Tools & Platforms:</span>{" "}
                {tailored_resume.skills.tools_platforms.join(", ")}
              </p>
            )}
          {tailored_resume.skills.methodologies &&
            tailored_resume.skills.methodologies.length > 0 && (
              <p className="text-slate-700">
                <span className="font-semibold">Methodologies:</span>{" "}
                {tailored_resume.skills.methodologies.join(", ")}
              </p>
            )}
        </>
      );
    }

    // Payroll candidate
    return (
      <>
        {tailored_resume.skills.payroll_systems &&
          tailored_resume.skills.payroll_systems.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">Payroll Systems:</span>{" "}
              {tailored_resume.skills.payroll_systems.join(", ")}
            </p>
          )}
        {tailored_resume.skills.hris_applications &&
          tailored_resume.skills.hris_applications.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">HRIS Applications:</span>{" "}
              {tailored_resume.skills.hris_applications.join(", ")}
            </p>
          )}
        {tailored_resume.skills.legislative_knowledge &&
          tailored_resume.skills.legislative_knowledge.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">Legislative Knowledge:</span>{" "}
              {tailored_resume.skills.legislative_knowledge.join(", ")}
            </p>
          )}
        {tailored_resume.skills.software_tools &&
          tailored_resume.skills.software_tools.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">Software Tools:</span>{" "}
              {tailored_resume.skills.software_tools.join(", ")}
            </p>
          )}
        {tailored_resume.skills.methodologies &&
          tailored_resume.skills.methodologies.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">Methodologies:</span>{" "}
              {tailored_resume.skills.methodologies.join(", ")}
            </p>
          )}
      </>
    );
  };

  const contactParts = [candidate.email, candidate.phone, candidate.location];
  if (candidate.linkedin) contactParts.push(candidate.linkedin);

  return (
    <div className="w-full">
      {/* ATS Score Display */}
      <div className="mb-6 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${
                    (optimization_notes.ats_score || 0) * 2.26
                  } 226`}
                  className={`${
                    (optimization_notes.ats_score || 0) >= 80
                      ? "text-emerald-400"
                      : (optimization_notes.ats_score || 0) >= 60
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {optimization_notes.ats_score || 0}%
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">ATS Compatibility Score</h2>
              <p className="text-slate-400 text-sm">
                {(optimization_notes.ats_score || 0) >= 80
                  ? "Excellent match! High chance of passing ATS."
                  : (optimization_notes.ats_score || 0) >= 60
                  ? "Good match. Consider addressing missing keywords."
                  : "Needs improvement. Review missing skills below."}
              </p>
            </div>
          </div>

          {optimization_notes.ats_breakdown && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                <p className="text-slate-400">Keywords</p>
                <p className="font-semibold text-lg">
                  {optimization_notes.ats_breakdown.keywords_match}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                <p className="text-slate-400">Skills</p>
                <p className="font-semibold text-lg">
                  {optimization_notes.ats_breakdown.skills_match}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                <p className="text-slate-400">Experience</p>
                <p className="font-semibold text-lg">
                  {optimization_notes.ats_breakdown.experience_relevance}%
                </p>
              </div>
              <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                <p className="text-slate-400">Format</p>
                <p className="font-semibold text-lg">
                  {optimization_notes.ats_breakdown.formatting_score}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Resume Generated!
            </h2>
            <p className="text-sm text-slate-500">
              Match Score:{" "}
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getMatchScoreColor(
                  optimization_notes.match_score
                )}`}
              >
                {optimization_notes.match_score}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onReset}
            onKeyDown={(e) => handleKeyDown(e, onReset)}
            aria-label="Start over with a new job description"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
                     rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4
                     focus:ring-slate-200 transition-all duration-200"
          >
            Start Over
          </button>

          <button
            onClick={handleCopyAll}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
                     rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4
                     focus:ring-slate-200 transition-all duration-200 flex items-center gap-2"
            aria-label="Copy full resume"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy All
          </button>

          <button
            onClick={handleDownloadPdf}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadPdf)}
            disabled={isDownloadingPdf}
            aria-label="Download resume as PDF"
            tabIndex={0}
            className="px-4 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-red-500 to-rose-500
                     rounded-lg shadow-lg shadow-red-500/25
                     hover:from-red-600 hover:to-rose-600
                     hover:shadow-xl hover:shadow-red-500/30
                     focus:outline-none focus:ring-4 focus:ring-red-300
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDownloadingPdf ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            )}
            PDF
          </button>

          <button
            onClick={handleDownloadDocx}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadDocx)}
            disabled={isDownloadingDocx}
            aria-label="Download resume as Word document"
            tabIndex={0}
            className="px-4 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-blue-500 to-indigo-500
                     rounded-lg shadow-lg shadow-blue-500/25
                     hover:from-blue-600 hover:to-indigo-600
                     hover:shadow-xl hover:shadow-blue-500/30
                     focus:outline-none focus:ring-4 focus:ring-blue-300
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDownloadingDocx ? (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            )}
            DOCX
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("preview")}
          onKeyDown={(e) => handleKeyDown(e, () => setActiveTab("preview"))}
          aria-label="View resume preview"
          aria-selected={activeTab === "preview"}
          tabIndex={0}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${
                      activeTab === "preview"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
        >
          Resume Preview
        </button>
        <button
          onClick={() => setActiveTab("optimization")}
          onKeyDown={(e) =>
            handleKeyDown(e, () => setActiveTab("optimization"))
          }
          aria-label="View optimization notes"
          aria-selected={activeTab === "optimization"}
          tabIndex={0}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${
                      activeTab === "optimization"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
        >
          Optimization Notes
        </button>
      </div>

      {/* Content */}
      {activeTab === "preview" ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-12">
          {/* Resume Header */}
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {candidate.name}
            </h1>
            <p className="text-slate-600 text-sm">{contactParts.join(" | ")}</p>
          </div>

          {/* Professional Summary */}
          <section className="mb-8 group relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex-1">
                Professional Summary
              </h2>
              <CopyButton
                section="Summary"
                content={tailored_resume.professional_summary}
              />
            </div>
            <p className="text-slate-700 leading-relaxed">
              {tailored_resume.professional_summary}
            </p>
          </section>

          {/* Highlights of Qualifications */}
          {tailored_resume.highlights_of_qualifications &&
            tailored_resume.highlights_of_qualifications.length > 0 && (
              <section className="mb-8 group relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex-1">
                    Highlights of Qualifications
                  </h2>
                  <CopyButton
                    section="Highlights"
                    content={tailored_resume.highlights_of_qualifications
                      .map((h) => `• ${h}`)
                      .join("\n")}
                  />
                </div>
                <ul className="space-y-2">
                  {tailored_resume.highlights_of_qualifications.map(
                    (highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <span className="text-amber-500 mt-1">✓</span>
                        <span>{highlight}</span>
                      </li>
                    )
                  )}
                </ul>
              </section>
            )}

          {/* Skills */}
          <section className="mb-8 group relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex-1">
                Skills
              </h2>
              <CopyButton section="Skills" content={getSkillsForCopy()} />
            </div>
            <div className="space-y-2">{renderSkills()}</div>
          </section>

          {/* Key Projects */}
          {tailored_resume.key_projects &&
            tailored_resume.key_projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mb-4">
                  Key Projects
                </h2>
                <div className="space-y-4">
                  {tailored_resume.key_projects.map((project, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-emerald-300 pl-4"
                    >
                      <h3 className="font-bold text-slate-800">
                        {project.name}
                      </h3>
                      <p className="text-slate-700 text-sm mb-2">
                        {project.description}
                      </p>
                      <p className="text-slate-600 text-sm">
                        <span className="font-semibold">Technologies:</span>{" "}
                        {project.technologies.join(", ")}
                      </p>
                      {project.impact && (
                        <p className="text-emerald-700 text-sm font-medium">
                          <span className="font-semibold">Impact:</span>{" "}
                          {project.impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mb-4">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {tailored_resume.experience.map((exp, index) => (
                <div key={index} className="group relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <h3 className="font-bold text-slate-800">
                          {exp.company} — {exp.location}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                        <p className="italic text-slate-700">{exp.role}</p>
                        <p className="text-slate-600 text-sm">{exp.dates}</p>
                      </div>
                      {exp.summary && (
                        <p className="text-slate-700 mb-2">{exp.summary}</p>
                      )}
                      <ul className="list-disc list-outside ml-5 space-y-1">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="text-slate-700">
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <CopyButton
                      section={exp.company}
                      content={`${exp.company} — ${exp.location}\n${
                        exp.role
                      } | ${exp.dates}\n${
                        exp.summary ? exp.summary + "\n" : ""
                      }${exp.achievements.map((a) => `• ${a}`).join("\n")}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mb-4">
              Education
            </h2>
            <div className="space-y-2">
              {tailored_resume.education.map((edu, index) => (
                <p key={index} className="text-slate-700">
                  <span className="font-semibold">{edu.degree}</span> —{" "}
                  {edu.institution}
                  {edu.location && <span>, {edu.location}</span>}
                </p>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Keywords Incorporated */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Keywords Incorporated ✓
            </h3>
            <div className="flex flex-wrap gap-2">
              {optimization_notes.keywords_incorporated.map(
                (keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"
                  >
                    {keyword}
                  </span>
                )
              )}
            </div>
          </section>

          {/* Keywords Missing */}
          {optimization_notes.keywords_missing &&
            optimization_notes.keywords_missing.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </span>
                    Keywords Missing (Skills Gap)
                  </h3>
                  {onRegenerateWithKeywords && (
                    <button
                      onClick={handleSelectAllKeywords}
                      className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
                      aria-label={
                        selectedKeywords.size ===
                        optimization_notes.keywords_missing.length
                          ? "Deselect all keywords"
                          : "Select all keywords"
                      }
                    >
                      {selectedKeywords.size ===
                      optimization_notes.keywords_missing.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  {onRegenerateWithKeywords
                    ? "Select keywords you have experience with to include them in your regenerated resume:"
                    : "These keywords from the job description couldn't be added because you don't have this experience:"}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {optimization_notes.keywords_missing.map((keyword, index) => {
                    const isSelected = selectedKeywords.has(keyword);
                    return (
                      <label
                        key={index}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200
                        ${
                          isSelected
                            ? "bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }
                        ${!onRegenerateWithKeywords ? "cursor-default" : ""}
                      `}
                      >
                        {onRegenerateWithKeywords && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleKeywordToggle(keyword)}
                            className="sr-only"
                            aria-label={`Select ${keyword}`}
                          />
                        )}
                        {onRegenerateWithKeywords && (
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center text-xs transition-colors
                          ${
                            isSelected
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "border-red-300 bg-white"
                          }`}
                          >
                            {isSelected && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                        )}
                        {keyword}
                      </label>
                    );
                  })}
                </div>

                {/* Regenerate Button */}
                {onRegenerateWithKeywords && selectedKeywords.size > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          {selectedKeywords.size} keyword
                          {selectedKeywords.size !== 1 ? "s" : ""} selected
                        </p>
                        <p className="text-xs text-amber-600">
                          These will be incorporated into your regenerated
                          resume
                        </p>
                      </div>
                      <button
                        onClick={handleRegenerateWithKeywords}
                        disabled={isRegenerating}
                        className="px-5 py-2.5 text-sm font-semibold text-white
                               bg-gradient-to-r from-amber-500 to-orange-500
                               rounded-lg shadow-lg shadow-amber-500/25
                               hover:from-amber-600 hover:to-orange-600
                               hover:shadow-xl hover:shadow-amber-500/30
                               focus:outline-none focus:ring-4 focus:ring-amber-300
                               transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed
                               flex items-center gap-2"
                        aria-label={`Regenerate resume with ${selectedKeywords.size} selected keywords`}
                      >
                        {isRegenerating ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Regenerate with Keywords
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

          {/* Skills Highlighted */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </span>
              Skills Highlighted
            </h3>
            <div className="flex flex-wrap gap-2">
              {optimization_notes.skills_highlighted.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Experience Reordered */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </span>
              Experience Reordered
            </h3>
            <p className="text-slate-700">
              {optimization_notes.experience_reordered
                ? "✓ Achievements have been reordered to highlight the most relevant experience for this role."
                : "Experience order maintained as originally provided."}
            </p>
          </section>

          {/* Suggestions */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </span>
              Additional Suggestions
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-slate-700 leading-relaxed">
                {optimization_notes.suggestions}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
