"use client";

import { useState } from "react";

interface InterviewPrepFormProps {
  onSubmit: (jobDescription: string, companyName?: string) => void;
  isLoading: boolean;
}

const InterviewPrepForm = ({ onSubmit, isLoading }: InterviewPrepFormProps) => {
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim().length >= 50) {
      onSubmit(jobDescription.trim(), companyName.trim() || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isFormValid = jobDescription.trim().length >= 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <label
          htmlFor="interviewCompanyName"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Company Name <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          id="interviewCompanyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Netflix, Shopify, Google"
          className="w-full px-4 py-3 rounded-xl border border-slate-200
                   focus:border-teal-400 focus:ring-4 focus:ring-teal-100
                   transition-all duration-200 text-slate-800 placeholder:text-slate-400
                   bg-white/50"
          aria-label="Company name"
        />
      </div>

      {/* Job Description */}
      <div>
        <label
          htmlFor="interviewJobDescription"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Job Description <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Paste the full job posting so we can match your projects and prepare tailored talking points.
        </p>
        <textarea
          id="interviewJobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the complete job description here..."
          rows={10}
          className="w-full px-4 py-3 rounded-xl border border-slate-200
                   focus:border-teal-400 focus:ring-4 focus:ring-teal-100
                   transition-all duration-200 text-slate-800 placeholder:text-slate-400
                   resize-none bg-white/50 font-mono text-sm"
          aria-label="Job description"
          required
        />
        <p className="text-xs text-slate-400 mt-1">
          {jobDescription.length} characters {jobDescription.length < 50 && "(minimum 50)"}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">⌘</kbd> +
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 ml-1">Enter</kbd> to generate
        </p>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="px-6 py-3 text-sm font-semibold text-white
                   bg-gradient-to-r from-teal-500 to-emerald-500
                   rounded-xl shadow-lg shadow-teal-500/25
                   hover:from-teal-600 hover:to-emerald-600
                   hover:shadow-xl hover:shadow-teal-500/30
                   focus:outline-none focus:ring-4 focus:ring-teal-300
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:shadow-lg"
          aria-label="Generate interview prep"
          tabIndex={0}
        >
          {isLoading ? (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Prepare Interview Materials
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default InterviewPrepForm;
