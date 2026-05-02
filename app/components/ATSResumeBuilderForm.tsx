"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { ATSResumeTitleRequest, AnthropicModelOption } from "@/lib/types";

interface ATSResumeBuilderFormProps {
  isLoading: boolean;
  modelOptions: AnthropicModelOption[];
  selectedModel: string;
  onSelectedModelChange: (value: string) => void;
  initialValues?: ATSResumeTitleRequest | null;
  pageLength: 2 | 3;
  onPageLengthChange: (value: 2 | 3) => void;
  includeCertifications: boolean;
  onIncludeCertificationsChange: (value: boolean) => void;
  onSubmit: (values: ATSResumeTitleRequest) => void;
}

const ATSResumeBuilderForm = ({
  isLoading,
  modelOptions,
  selectedModel,
  onSelectedModelChange,
  initialValues,
  pageLength,
  onPageLengthChange,
  includeCertifications,
  onIncludeCertificationsChange,
  onSubmit,
}: ATSResumeBuilderFormProps) => {
  const [jobDescription, setJobDescription] = useState(
    initialValues?.jobDescription ?? ""
  );

  const isJDValid = useMemo(
    () => jobDescription.trim().length >= 50,
    [jobDescription]
  );

  const isFormValid = isJDValid;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    onSubmit({
      jobDescription: jobDescription.trim(),
      anthropicModel: selectedModel,
      includeCertifications,
    });
  };

  const handleJDKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.metaKey) {
      event.preventDefault();
      if (isFormValid) handleSubmit(event as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="ats-anthropic-model"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          AI Model
        </label>
        <select
          id="ats-anthropic-model"
          value={selectedModel}
          onChange={(event) => onSelectedModelChange(event.target.value)}
          disabled={isLoading || modelOptions.length === 0}
          aria-label="Select Anthropic model"
          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
        >
          {modelOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.displayName} ({option.id})
            </option>
          ))}
        </select>
      </div>

      {/* ── Job Description ── */}
      <div>
        <label
          htmlFor="ats-job-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ats-job-description"
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onKeyDown={handleJDKeyDown}
          disabled={isLoading}
          aria-label="Job description"
          aria-required="true"
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all resize-none font-mono text-sm leading-relaxed"
          placeholder="Paste the full job description here..."
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {isJDValid ? "Job description ready." : `Minimum 50 characters required (${jobDescription.length}/50)`}
        </p>
      </div>

      {/* ── Resume Length ── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Resume Length
        </label>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 w-fit">
          <button
            type="button"
            onClick={() => onPageLengthChange(2)}
            disabled={isLoading}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              pageLength === 2
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            } disabled:cursor-not-allowed`}
          >
            2 Pages
          </button>
          <button
            type="button"
            onClick={() => onPageLengthChange(3)}
            disabled={isLoading}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              pageLength === 3
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            } disabled:cursor-not-allowed`}
          >
            3 Pages
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          2 pages recommended for &lt; 8 years experience
        </p>
      </div>

      {/* ── Include Certifications ── */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCertifications}
            onChange={(e) => onIncludeCertificationsChange(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-slate-700">
            Include Certifications (CPA, ACCA)
          </span>
        </label>
        <p className="text-xs text-slate-400 mt-1.5 ml-7">
          Adds CPA Ontario, ACCA, and Advanced Diploma in Accounting to the Education section
        </p>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        aria-label="Generate job title options from this job description"
        className="w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating Title Suggestions..." : "Generate Job Titles"}
      </button>
    </form>
  );
};

export default ATSResumeBuilderForm;
