"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { ATSResumeTitleRequest } from "@/lib/types";

interface ATSResumeBuilderFormProps {
  isLoading: boolean;
  initialValues?: ATSResumeTitleRequest | null;
  onSubmit: (values: ATSResumeTitleRequest) => void;
}

const ATSResumeBuilderForm = ({
  isLoading,
  initialValues,
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
