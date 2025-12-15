"use client";

import { useState } from "react";
import { CoverLetterResponse } from "@/app/api/generate-cover-letter/route";
import { generateCoverLetterDocx } from "@/lib/generateCoverLetterDocx";
import { generateCoverLetterPdf } from "@/lib/generateCoverLetterPdf";
import { saveAs } from "file-saver";
import { CandidateData } from "@/lib/types";
import { candidateData as defaultCandidate } from "@/lib/candidateData";

interface CoverLetterPreviewProps {
  data: CoverLetterResponse;
  companyName: string;
  onReset: () => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  candidate?: CandidateData;
}

const CoverLetterPreview = ({
  data,
  companyName,
  onReset,
  onToast,
  candidate = defaultCandidate,
}: CoverLetterPreviewProps) => {
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  const { cover_letter, metadata } = data;

  // Construct full letter text
  const fullLetterText = `${cover_letter.greeting}

${cover_letter.opening_paragraph}

${cover_letter.body_paragraph_1}

${cover_letter.body_paragraph_2}

${cover_letter.closing_paragraph}

${cover_letter.signature.replace("\\n", "\n")}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullLetterText);
      setCopied(true);
      onToast?.("Cover letter copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast?.("Failed to copy to clipboard", "error");
    }
  };

  const handleDownloadDocx = async () => {
    setIsDownloadingDocx(true);
    try {
      const blob = await generateCoverLetterDocx(
        cover_letter,
        companyName,
        candidate
      );
      const fileName = `${candidate.name
        .replace(/\s+/g, "_")
        .replace(/\(.*?\)/g, "")}_CoverLetter_${companyName.replace(
        /\s+/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.docx`;
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
      const blob = generateCoverLetterPdf(cover_letter, companyName, candidate);
      const fileName = `${candidate.name
        .replace(/\s+/g, "_")
        .replace(/\(.*?\)/g, "")}_CoverLetter_${companyName.replace(
        /\s+/g,
        "_"
      )}_${new Date().toISOString().split("T")[0]}.pdf`;
      saveAs(blob, fileName);
      onToast?.("PDF downloaded!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      onToast?.("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const contactParts = [candidate.email, candidate.phone, candidate.location];

  return (
    <div className="w-full">
      {/* Tone Badge */}
      <div className="mb-6 p-4 bg-gradient-to-r from-violet-900 to-purple-800 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {metadata.tone_used === "conversational" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Cover Letter Generated!</h2>
              <p className="text-violet-200 text-sm">
                Tone:{" "}
                <span className="capitalize font-medium text-white">
                  {metadata.tone_used}
                </span>
              </p>
            </div>
          </div>
          <div className="text-sm text-violet-200 max-w-md">
            {metadata.tone_reason}
          </div>
        </div>
      </div>

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
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
              For {companyName}
            </h2>
            <p className="text-sm text-slate-500">
              {metadata.key_points_addressed.length} key points addressed
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onReset}
            onKeyDown={(e) => handleKeyDown(e, onReset)}
            aria-label="Start over"
            tabIndex={0}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
                     rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4
                     focus:ring-slate-200 transition-all duration-200"
          >
            Start Over
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100
                     rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4
                     focus:ring-slate-200 transition-all duration-200 flex items-center gap-2"
            aria-label="Copy cover letter"
            tabIndex={0}
          >
            {copied ? (
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
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            onClick={handleDownloadPdf}
            onKeyDown={(e) => handleKeyDown(e, handleDownloadPdf)}
            disabled={isDownloadingPdf}
            aria-label="Download as PDF"
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
            aria-label="Download as Word document"
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

      {/* Cover Letter Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">{candidate.name}</h3>
          <p className="text-slate-600 text-sm">{contactParts.join(" | ")}</p>
        </div>

        {/* Letter Body */}
        <div className="prose prose-slate max-w-none">
          {/* Greeting */}
          <p className="text-slate-800 font-medium mb-6">
            {cover_letter.greeting}
          </p>

          {/* Opening */}
          <p className="text-slate-700 leading-relaxed mb-4">
            {cover_letter.opening_paragraph}
          </p>

          {/* Body 1 */}
          <p className="text-slate-700 leading-relaxed mb-4">
            {cover_letter.body_paragraph_1}
          </p>

          {/* Body 2 */}
          <p className="text-slate-700 leading-relaxed mb-4">
            {cover_letter.body_paragraph_2}
          </p>

          {/* Closing */}
          <p className="text-slate-700 leading-relaxed mb-6">
            {cover_letter.closing_paragraph}
          </p>

          {/* Signature */}
          <div className="text-slate-800">
            {cover_letter.signature.split("\\n").map((line, i) => (
              <p key={i} className={i === 0 ? "mb-1" : "font-semibold"}>
                {line.replace("[Name]", candidate.name)}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="mt-6 bg-slate-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Generation Details
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Points Addressed */}
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">
              Key Points Addressed
            </h4>
            <div className="flex flex-wrap gap-2">
              {metadata.key_points_addressed.map((point, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          {/* Company-Specific Mentions */}
          <div>
            <h4 className="text-sm font-semibold text-slate-600 mb-2">
              Company-Specific Mentions
            </h4>
            <div className="flex flex-wrap gap-2">
              {metadata.company_specific_mentions.map((mention, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {mention}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
