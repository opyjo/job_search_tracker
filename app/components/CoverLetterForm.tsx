"use client";

import { useState } from "react";

interface CoverLetterFormProps {
  onSubmit: (companyName: string, whyThisCompany: string, jobDescription: string, companyMission?: string) => void;
  isLoading: boolean;
}

// Quick-select reasons with templates
const QUICK_REASONS = [
  {
    id: "innovation",
    label: "🚀 Innovation",
    icon: "🚀",
    text: "their innovative approach to solving complex problems and pushing technological boundaries",
  },
  {
    id: "culture",
    label: "🤝 Culture",
    icon: "🤝",
    text: "their collaborative and inclusive work culture that values growth and continuous learning",
  },
  {
    id: "growth",
    label: "📈 Growth",
    icon: "📈",
    text: "the opportunity for professional growth and the chance to work on impactful projects",
  },
  {
    id: "mission",
    label: "🎯 Mission",
    icon: "🎯",
    text: "their mission-driven approach and commitment to making a meaningful impact",
  },
  {
    id: "technology",
    label: "💻 Tech Stack",
    icon: "💻",
    text: "their modern tech stack and engineering excellence that aligns with my technical expertise",
  },
  {
    id: "product",
    label: "📱 Product",
    icon: "📱",
    text: "their product that I genuinely admire and use, and I'm excited to contribute to its evolution",
  },
  {
    id: "team",
    label: "👥 Team",
    icon: "👥",
    text: "the talented team and the opportunity to learn from industry experts",
  },
  {
    id: "remote",
    label: "🌍 Remote",
    icon: "🌍",
    text: "their flexible remote work policy that enables a healthy work-life balance",
  },
];

const CoverLetterForm = ({ onSubmit, isLoading }: CoverLetterFormProps) => {
  const [companyName, setCompanyName] = useState("");
  const [companyMission, setCompanyMission] = useState("");
  const [whyThisCompany, setWhyThisCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && whyThisCompany.trim() && jobDescription.trim()) {
      onSubmit(
        companyName.trim(), 
        whyThisCompany.trim(), 
        jobDescription.trim(),
        companyMission.trim() || undefined
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleQuickReasonToggle = (reasonId: string) => {
    const reason = QUICK_REASONS.find((r) => r.id === reasonId);
    if (!reason) return;

    const companyRef = companyName.trim() || "[Company]";

    if (selectedReasons.includes(reasonId)) {
      // Remove reason
      setSelectedReasons(selectedReasons.filter((id) => id !== reasonId));
      // Rebuild text without this reason
      const remainingReasons = selectedReasons
        .filter((id) => id !== reasonId)
        .map((id) => QUICK_REASONS.find((r) => r.id === id)?.text)
        .filter(Boolean);
      
      if (remainingReasons.length === 0) {
        setWhyThisCompany("");
      } else {
        setWhyThisCompany(
          `I'm excited about ${companyRef} because of ${formatReasonsList(remainingReasons as string[])}.`
        );
      }
    } else {
      // Add reason
      const newSelectedReasons = [...selectedReasons, reasonId];
      setSelectedReasons(newSelectedReasons);
      
      const allReasonTexts = newSelectedReasons
        .map((id) => QUICK_REASONS.find((r) => r.id === id)?.text)
        .filter(Boolean) as string[];
      
      setWhyThisCompany(
        `I'm excited about ${companyRef} because of ${formatReasonsList(allReasonTexts)}.`
      );
    }
  };

  const formatReasonsList = (reasons: string[]): string => {
    if (reasons.length === 0) return "";
    if (reasons.length === 1) return reasons[0];
    if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
    const lastReason = reasons[reasons.length - 1];
    const otherReasons = reasons.slice(0, -1).join(", ");
    return `${otherReasons}, and ${lastReason}`;
  };

  const handleClearReasons = () => {
    setSelectedReasons([]);
    setWhyThisCompany("");
  };

  // Update company name in the why text when it changes
  const handleCompanyNameChange = (newName: string) => {
    setCompanyName(newName);
    
    // If there are selected reasons, update the text with new company name
    if (selectedReasons.length > 0) {
      const companyRef = newName.trim() || "[Company]";
      const allReasonTexts = selectedReasons
        .map((id) => QUICK_REASONS.find((r) => r.id === id)?.text)
        .filter(Boolean) as string[];
      
      setWhyThisCompany(
        `I'm excited about ${companyRef} because of ${formatReasonsList(allReasonTexts)}.`
      );
    }
  };

  const isFormValid = companyName.trim().length > 0 && 
                      whyThisCompany.trim().length > 20 && 
                      jobDescription.trim().length > 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          value={companyName}
          onChange={(e) => handleCompanyNameChange(e.target.value)}
          placeholder="e.g., Netflix, Shopify, Google"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 
                   focus:border-violet-400 focus:ring-4 focus:ring-violet-100
                   transition-all duration-200 text-slate-800 placeholder:text-slate-400
                   bg-white/50"
          aria-label="Company name"
          required
        />
      </div>

      {/* Company Mission & Vision (Optional) */}
      <div>
        <label
          htmlFor="companyMission"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Company Mission & Vision <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Paste the company&apos;s mission/vision statement to make your cover letter more personalized.
        </p>
        <textarea
          id="companyMission"
          value={companyMission}
          onChange={(e) => setCompanyMission(e.target.value)}
          placeholder="e.g., Our mission is to entertain the world. We connect people with stories that move them — wherever they are, whenever they want..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 
                   focus:border-violet-400 focus:ring-4 focus:ring-violet-100
                   transition-all duration-200 text-slate-800 placeholder:text-slate-400
                   resize-none bg-white/50 text-sm"
          aria-label="Company mission and vision"
        />
        {companyMission.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Will be referenced in your cover letter
          </p>
        )}
      </div>

      {/* Why This Company */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="whyThisCompany"
            className="block text-sm font-semibold text-slate-700"
          >
            Why do you want to work at this company? <span className="text-red-500">*</span>
          </label>
          {selectedReasons.length > 0 && (
            <button
              type="button"
              onClick={handleClearReasons}
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              aria-label="Clear selected reasons"
            >
              Clear selections
            </button>
          )}
        </div>
        
        {/* Quick Select Buttons */}
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2">
            Quick select (click to add/remove):
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((reason) => (
              <button
                key={reason.id}
                type="button"
                onClick={() => handleQuickReasonToggle(reason.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                          ${selectedReasons.includes(reason.id)
                            ? "bg-violet-100 text-violet-700 border-violet-300 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                aria-label={`${selectedReasons.includes(reason.id) ? "Remove" : "Add"} ${reason.label}`}
                aria-pressed={selectedReasons.includes(reason.id)}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="whyThisCompany"
          value={whyThisCompany}
          onChange={(e) => {
            setWhyThisCompany(e.target.value);
            // If user manually edits, clear the quick select state
            if (selectedReasons.length > 0) {
              setSelectedReasons([]);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Click the buttons above for quick fill, or write your own reason..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 
                   focus:border-violet-400 focus:ring-4 focus:ring-violet-100
                   transition-all duration-200 text-slate-800 placeholder:text-slate-400
                   resize-none bg-white/50"
          aria-label="Why you want to work at this company"
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-slate-400">
            {whyThisCompany.length} characters {whyThisCompany.length < 20 && "(minimum 20)"}
          </p>
          {selectedReasons.length > 0 && (
            <p className="text-xs text-violet-500">
              {selectedReasons.length} reason{selectedReasons.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div>
        <label
          htmlFor="jobDescription"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Job Description <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Paste the full job posting to help tailor your cover letter to the specific role.
        </p>
        <textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the complete job description here..."
          rows={8}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 
                   focus:border-violet-400 focus:ring-4 focus:ring-violet-100
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
                   bg-gradient-to-r from-violet-500 to-purple-500
                   rounded-xl shadow-lg shadow-violet-500/25
                   hover:from-violet-600 hover:to-purple-600
                   hover:shadow-xl hover:shadow-violet-500/30
                   focus:outline-none focus:ring-4 focus:ring-violet-300
                   transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   disabled:hover:shadow-lg"
          aria-label="Generate cover letter"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Generate Cover Letter
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CoverLetterForm;
