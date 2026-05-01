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
}: DynamicATSResumePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "optimization">(
    "preview"
  );
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const { dynamic_resume: resume, optimization_notes } = data;
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
                <h3 className="text-base font-bold text-slate-800 mb-3">
                  Skills Gap (Keywords Missing)
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  These keywords appear in the job description but are not
                  present in your provided background.
                </p>
                <div className="flex flex-wrap gap-2">
                  {optimization_notes.keywords_missing.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
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
