"use client";

import { useState } from "react";
import { ResumeResponse } from "@/lib/types";
import { generateResumeDocx } from "@/lib/generateDocx";
import { saveAs } from "file-saver";
import { candidateData } from "@/lib/candidateData";

interface ResumePreviewProps {
  data: ResumeResponse;
  onReset: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

const ResumePreview = ({ data, onReset, onToast }: ResumePreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "optimization">("preview");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const { tailored_resume, optimization_notes } = data;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateResumeDocx(tailored_resume);
      const fileName = `${candidateData.name.replace(/\s+/g, "_")}_Resume_${new Date().toISOString().split("T")[0]}.docx`;
      saveAs(blob, fileName);
      onToast?.("Resume downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating document:", error);
      onToast?.("Failed to generate document. Please try again.", "error");
    } finally {
      setIsDownloading(false);
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
    const { professional_summary, skills, experience, education } = tailored_resume;
    
    let text = `${candidateData.name}\n`;
    text += `${candidateData.email} | ${candidateData.phone} | ${candidateData.location} | ${candidateData.linkedin}\n\n`;
    
    text += `PROFESSIONAL SUMMARY\n${professional_summary}\n\n`;
    
    text += `SKILLS\n`;
    if (skills.languages?.length) text += `Languages: ${skills.languages.join(", ")}\n`;
    if (skills.frameworks_libraries?.length) text += `Frameworks & Libraries: ${skills.frameworks_libraries.join(", ")}\n`;
    if (skills.architecture?.length) text += `Architecture: ${skills.architecture.join(", ")}\n`;
    if (skills.tools_platforms?.length) text += `Tools & Platforms: ${skills.tools_platforms.join(", ")}\n`;
    if (skills.methodologies?.length) text += `Methodologies: ${skills.methodologies.join(", ")}\n`;
    text += `\n`;
    
    text += `EXPERIENCE\n`;
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
      text += `${edu.degree} — ${edu.institution}${edu.location ? `, ${edu.location}` : ""}\n`;
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

  const CopyButton = ({ section, content }: { section: string; content: string }) => (
    <button
      onClick={() => handleCopySection(section, content)}
      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
      aria-label={`Copy ${section}`}
      title={`Copy ${section}`}
    >
      {copiedSection === section ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="w-full">
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
            <h2 className="text-xl font-bold text-slate-800">Resume Generated!</h2>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy All
          </button>
          
          <button
            onClick={handleDownload}
            onKeyDown={(e) => handleKeyDown(e, handleDownload)}
            disabled={isDownloading}
            aria-label="Download resume as Word document"
            tabIndex={0}
            className="px-5 py-2 text-sm font-semibold text-white
                     bg-gradient-to-r from-emerald-500 to-teal-500
                     rounded-lg shadow-lg shadow-emerald-500/25
                     hover:from-emerald-600 hover:to-teal-600
                     hover:shadow-xl hover:shadow-emerald-500/30
                     focus:outline-none focus:ring-4 focus:ring-emerald-300
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download .docx
              </span>
            )}
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
                    ${activeTab === "preview"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                    }`}
        >
          Resume Preview
        </button>
        <button
          onClick={() => setActiveTab("optimization")}
          onKeyDown={(e) => handleKeyDown(e, () => setActiveTab("optimization"))}
          aria-label="View optimization notes"
          aria-selected={activeTab === "optimization"}
          tabIndex={0}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${activeTab === "optimization"
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
              {candidateData.name}
            </h1>
            <p className="text-slate-600 text-sm">
              {candidateData.email} | {candidateData.phone} | {candidateData.location} | {candidateData.linkedin}
            </p>
          </div>
          
          {/* Professional Summary */}
          <section className="mb-8 group relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex-1">
                Professional Summary
              </h2>
              <CopyButton section="Summary" content={tailored_resume.professional_summary} />
            </div>
            <p className="text-slate-700 leading-relaxed">
              {tailored_resume.professional_summary}
            </p>
          </section>
          
          {/* Skills */}
          <section className="mb-8 group relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 flex-1">
                Skills
              </h2>
              <CopyButton 
                section="Skills" 
                content={[
                  tailored_resume.skills.languages?.length ? `Languages: ${tailored_resume.skills.languages.join(", ")}` : "",
                  tailored_resume.skills.frameworks_libraries?.length ? `Frameworks & Libraries: ${tailored_resume.skills.frameworks_libraries.join(", ")}` : "",
                  tailored_resume.skills.architecture?.length ? `Architecture: ${tailored_resume.skills.architecture.join(", ")}` : "",
                  tailored_resume.skills.tools_platforms?.length ? `Tools & Platforms: ${tailored_resume.skills.tools_platforms.join(", ")}` : "",
                  tailored_resume.skills.methodologies?.length ? `Methodologies: ${tailored_resume.skills.methodologies.join(", ")}` : "",
                ].filter(Boolean).join("\n")} 
              />
            </div>
            <div className="space-y-2">
              {tailored_resume.skills.languages?.length > 0 && (
                <p className="text-slate-700">
                  <span className="font-semibold">Languages:</span>{" "}
                  {tailored_resume.skills.languages.join(", ")}
                </p>
              )}
              {tailored_resume.skills.frameworks_libraries?.length > 0 && (
                <p className="text-slate-700">
                  <span className="font-semibold">Frameworks & Libraries:</span>{" "}
                  {tailored_resume.skills.frameworks_libraries.join(", ")}
                </p>
              )}
              {tailored_resume.skills.architecture?.length > 0 && (
                <p className="text-slate-700">
                  <span className="font-semibold">Architecture:</span>{" "}
                  {tailored_resume.skills.architecture.join(", ")}
                </p>
              )}
              {tailored_resume.skills.tools_platforms?.length > 0 && (
                <p className="text-slate-700">
                  <span className="font-semibold">Tools & Platforms:</span>{" "}
                  {tailored_resume.skills.tools_platforms.join(", ")}
                </p>
              )}
              {tailored_resume.skills.methodologies?.length > 0 && (
                <p className="text-slate-700">
                  <span className="font-semibold">Methodologies:</span>{" "}
                  {tailored_resume.skills.methodologies.join(", ")}
                </p>
              )}
            </div>
          </section>
          
          {/* Experience */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider border-b-2 border-slate-300 pb-1 mb-4">
              Experience
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
                      content={`${exp.company} — ${exp.location}\n${exp.role} | ${exp.dates}\n${exp.summary ? exp.summary + "\n" : ""}${exp.achievements.map(a => `• ${a}`).join("\n")}`}
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
                  <span className="font-semibold">{edu.degree}</span> — {edu.institution}
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
              <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </span>
              Keywords Incorporated
            </h3>
            <div className="flex flex-wrap gap-2">
              {optimization_notes.keywords_incorporated.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>
          
          {/* Skills Highlighted */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
