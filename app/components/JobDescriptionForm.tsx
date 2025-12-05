"use client";

import { useState, FormEvent, ChangeEvent, KeyboardEvent } from "react";

interface JobDescriptionFormProps {
  onSubmit: (jobDescription: string) => void;
  isLoading: boolean;
}

const JobDescriptionForm = ({ onSubmit, isLoading }: JobDescriptionFormProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);
    setCharCount(value.length);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim().length >= 50) {
      onSubmit(jobDescription);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      if (jobDescription.trim().length >= 50) {
        onSubmit(jobDescription);
      }
    }
  };

  const handleClear = () => {
    setJobDescription("");
    setCharCount(0);
  };

  const isValid = jobDescription.trim().length >= 50;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Job Description
        </label>
        
        <div className="relative group">
          <textarea
            id="job-description"
            name="job-description"
            rows={12}
            value={jobDescription}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Paste the full job description here...&#10;&#10;Include all requirements, qualifications, responsibilities, and any other relevant details from the job posting."
            disabled={isLoading}
            aria-label="Job description input"
            aria-describedby="char-count-hint"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl
                     text-slate-800 placeholder-slate-400
                     focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100
                     transition-all duration-200 ease-in-out
                     disabled:bg-slate-50 disabled:cursor-not-allowed
                     resize-none font-mono text-sm leading-relaxed"
          />
          
          {/* Gradient overlay when loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl pointer-events-none" />
          )}
        </div>
        
        {/* Character count and hint */}
        <div className="flex justify-between items-center mt-2 text-xs">
          <span
            id="char-count-hint"
            className={`transition-colors ${
              charCount > 0 && charCount < 50
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            {charCount > 0 && charCount < 50
              ? `${50 - charCount} more characters needed`
              : charCount > 0
              ? "✓ Ready to generate"
              : "Minimum 50 characters required"}
          </span>
          <span className="text-slate-400">{charCount} characters</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading || charCount === 0}
          aria-label="Clear job description"
          tabIndex={0}
          className="px-5 py-3 text-sm font-medium text-slate-600 bg-slate-100
                   rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4
                   focus:ring-slate-200 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        
        <button
          type="submit"
          disabled={isLoading || !isValid}
          aria-label="Generate tailored resume"
          tabIndex={0}
          className="flex-1 px-6 py-3 text-sm font-semibold text-white
                   bg-gradient-to-r from-amber-500 to-orange-500
                   rounded-xl shadow-lg shadow-amber-500/25
                   hover:from-amber-600 hover:to-orange-600
                   hover:shadow-xl hover:shadow-amber-500/30
                   focus:outline-none focus:ring-4 focus:ring-amber-300
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:shadow-none disabled:hover:from-amber-500
                   disabled:hover:to-orange-500"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
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
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Tailored Resume
            </span>
          )}
        </button>
      </div>
      
      {/* Keyboard shortcut hint */}
      <p className="text-center text-xs text-slate-400 mt-3">
        Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">Enter</kbd> to generate
      </p>
    </form>
  );
};

export default JobDescriptionForm;

