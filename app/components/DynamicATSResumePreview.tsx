"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import {
  DynamicATSResumeResponse,
  DynamicATSResume,
} from "@/lib/types";
import { generateDynamicATSDocx } from "@/lib/generateAtsDocx";
import { generateDynamicATSDocxFromTemplate } from "@/lib/generateAtsDocxFromTemplate";
import { generateDynamicATSPdf } from "@/lib/generateAtsPdf";

interface DynamicATSResumePreviewProps {
  data: DynamicATSResumeResponse;
  onReset: () => void;
  onBackToForm: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  onRegenerateWithKeywords?: (keywords: string[]) => void;
  isRegenerating?: boolean;
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mb-4">
    {children}
  </h2>
);

const ATSScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 85
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : score >= 70
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${color}`}
      aria-label={`ATS score: ${score} out of 100`}
    >
      ATS {score}/100
    </span>
  );
};

const buildPlainText = (resume: DynamicATSResume): string => {
  const c = resume.contact;
  const contactLine = [c.email, c.phone, c.location, c.linkedin]
    .filter(Boolean)
    .join(" | ");

  let text = `${c.name}\n`;
  if (resume.target_job_title) text += `${resume.target_job_title}\n`;
  if (contactLine) text += `${contactLine}\n`;
  text += "\n";

  text += `PROFESSIONAL SUMMARY\n${resume.professional_summary}\n\n`;

  if (resume.highlights?.length) {
    text += `HIGHLIGHTS OF QUALIFICATIONS\n`;
    resume.highlights.forEach((h) => (text += `\u2713 ${h}\n`));
    text += "\n";
  }

  if (resume.skills?.length) {
    text += `SKILLS\n`;
    resume.skills.forEach(
      (g) => (text += `${g.label}: ${g.items.join(", ")}\n`)
    );
    text += "\n";
  }

  if (resume.experience?.length) {
    text += `PROFESSIONAL EXPERIENCE\n`;
    resume.experience.forEach((exp) => {
      text += `${exp.company}${exp.location ? ` \u2014 ${exp.location}` : ""}\n`;
      text += `${exp.role} | ${exp.dates}\n`;
      exp.achievements.forEach((a) => (text += `\u2022 ${a}\n`));
      text += "\n";
    });
  }

  if (resume.education?.length) {
    text += `EDUCATION\n`;
    resume.education.forEach(
      (e) =>
        (text += `${e.degree} \u2014 ${e.institution}${e.location ? `, ${e.location}` : ""}\n`)
    );
    text += "\n";
  }

  resume.additional_sections?.forEach((sec) => {
    text += `${sec.heading.toUpperCase()}\n`;
    sec.bullets.forEach((b) => (text += `\u2022 ${b}\n`));
    text += "\n";
  });

  return text;
};

const DynamicATSResumePreview = ({
  data,
  onReset,
  onBackToForm,
  onToast,
  onRegenerateWithKeywords,
  isRegenerating = false,
}: DynamicATSResumePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "optimization">(
    "preview"
  );
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set()
  );

  const { dynamic_resume: resume, optimization_notes } = data;

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

  const handleRegenerateWithKeywords = () => {
    if (selectedKeywords.size > 0 && onRegenerateWithKeywords) {
      onRegenerateWithKeywords(Array.from(selectedKeywords));
    }
  };
  const safeName = resume.contact.name.replace(/\s+/g, "_") || "Resume";
  const dateStamp = new Date().toISOString().split("T")[0];
  const fileName = `${safeName}_ATS_${dateStamp}`;

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const blob = await generateDynamicATSDocxFromTemplate(resume);
      saveAs(blob, `${fileName}.docx`);
      onToast?.("Word document downloaded!", "success");
    } catch {
      try {
        const fallbackBlob = await generateDynamicATSDocx(resume);
        saveAs(fallbackBlob, `${fileName}.docx`);
        onToast?.(
          "Template render failed. Downloaded Word document using fallback format.",
          "info"
        );
      } catch {
        onToast?.("Failed to generate Word document.", "error");
      }
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      const blob = generateDynamicATSPdf(resume);
      saveAs(blob, `${fileName}.pdf`);
      onToast?.("PDF downloaded!", "success");
    } catch {
      onToast?.("Failed to generate PDF.", "error");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(resume));
      onToast?.("Resume copied to clipboard!", "success");
    } catch {
      onToast?.("Failed to copy.", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-slate-200/50 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToForm}
            onKeyDown={(e) => handleKeyDown(e, onBackToForm)}
            aria-label="Back to form"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
          >
            ← Back to Form
          </button>
          <button
            onClick={onReset}
            onKeyDown={(e) => handleKeyDown(e, onReset)}
            aria-label="Start over"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
          >
            ← Start Over
          </button>
          <ATSScoreBadge score={optimization_notes.ats_score} />
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full border ${
              optimization_notes.match_score === "High"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : optimization_notes.match_score === "Medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {optimization_notes.match_score} Match
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopyAll}
            onKeyDown={(e) => handleKeyDown(e, handleCopyAll)}
            aria-label="Copy resume to clipboard"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
          >
            Copy All
          </button>
          <button
            onClick={handleDownloadPdf}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadPdf)}
            disabled={isDownloadingPdf}
            aria-label="Download PDF"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50"
          >
            {isDownloadingPdf ? "Generating..." : "PDF"}
          </button>
          <button
            onClick={handleDownloadDocx}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadDocx)}
            disabled={isDownloadingDocx}
            aria-label="Download Word document"
            tabIndex={0}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all disabled:opacity-50"
          >
            {isDownloadingDocx ? "Generating..." : "Word (.docx)"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-slate-100 p-1 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab("preview")}
          onKeyDown={(e) => handleKeyDown(e, () => setActiveTab("preview"))}
          aria-label="Resume preview"
          tabIndex={0}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
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
          aria-label="Optimization notes"
          tabIndex={0}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "optimization"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Optimization Notes
        </button>
      </div>

      {activeTab === "preview" ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-12">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              {resume.contact.name}
            </h1>
            {resume.target_job_title && (
              <p className="text-slate-700 font-semibold mb-2">
                {resume.target_job_title}
              </p>
            )}
            <p className="text-slate-500 text-sm">
              {[
                resume.contact.email,
                resume.contact.phone,
                resume.contact.location,
                resume.contact.linkedin,
              ]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>

          {/* Professional Summary */}
          <section className="mb-8">
            <SectionHeading>Professional Summary</SectionHeading>
            <p className="text-slate-700 leading-relaxed">
              {resume.professional_summary}
            </p>
          </section>

          {/* Highlights */}
          {resume.highlights?.length > 0 && (
            <section className="mb-8">
              <SectionHeading>Highlights of Qualifications</SectionHeading>
              <ul className="space-y-2">
                {resume.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <span className="text-amber-500 mt-0.5">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills — dynamic groupings */}
          {resume.skills?.length > 0 && (
            <section className="mb-8">
              <SectionHeading>Skills</SectionHeading>
              <div className="space-y-2">
                {resume.skills.map((group, i) => (
                  <p key={i} className="text-slate-700 text-sm">
                    <span className="font-semibold">{group.label}:</span>{" "}
                    {group.items.join(", ")}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {resume.experience?.length > 0 && (
            <section className="mb-8">
              <SectionHeading>Professional Experience</SectionHeading>
              <div className="space-y-6">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                      <h3 className="font-bold text-slate-800">
                        {exp.company}
                        {exp.location && (
                          <span className="font-normal text-slate-500">
                            {" "}
                            — {exp.location}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                      <p className="italic text-slate-700">{exp.role}</p>
                      <p className="text-slate-500 text-sm">{exp.dates}</p>
                    </div>
                    <ul className="list-disc list-outside ml-5 space-y-1">
                      {exp.achievements.map((a, j) => (
                        <li key={j} className="text-slate-700">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {resume.education?.length > 0 && (
            <section className="mb-8">
              <SectionHeading>Education</SectionHeading>
              <div className="space-y-2">
                {resume.education.map((edu, i) => (
                  <p key={i} className="text-slate-700">
                    <span className="font-semibold">{edu.degree}</span> —{" "}
                    {edu.institution}
                    {edu.location && (
                      <span className="text-slate-500">, {edu.location}</span>
                    )}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Additional sections */}
          {resume.additional_sections?.map((sec, i) => (
            <section key={i} className="mb-8">
              <SectionHeading>{sec.heading}</SectionHeading>
              <ul className="list-disc list-outside ml-5 space-y-1">
                {sec.bullets.map((b, j) => (
                  <li key={j} className="text-slate-700">
                    {b}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-8">
          {/* Keywords incorporated */}
          {optimization_notes.keywords_incorporated?.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-slate-800 mb-3">
                Keywords Incorporated ✓
              </h3>
              <div className="flex flex-wrap gap-2">
                {optimization_notes.keywords_incorporated.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Keywords missing */}
          {optimization_notes.keywords_missing &&
            optimization_notes.keywords_missing.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-800">
                    Skills Gap (Keywords Missing)
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
                    : "These keywords appear in the job description but are not present in your provided background."}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {optimization_notes.keywords_missing.map((kw, i) => {
                    const isSelected = selectedKeywords.has(kw);
                    return (
                      <label
                        key={i}
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
                            onChange={() => handleKeywordToggle(kw)}
                            className="sr-only"
                            aria-label={`Select ${kw}`}
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
                        {kw}
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

          {/* Suggestions */}
          {optimization_notes.suggestions && (
            <section>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                Suggestions
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {optimization_notes.suggestions}
              </p>
            </section>
          )}

          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Resume generated entirely from your job description and pasted
              background. Contact line set from your contact info.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicATSResumePreview;
