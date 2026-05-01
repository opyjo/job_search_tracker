"use client";

import { ATSExperienceTitleSuggestion, GeneratedJobTitleOption } from "@/lib/types";

interface ATSJobTitleReviewProps {
  options: GeneratedJobTitleOption[];
  selectedTitle: string;
  experienceTitleSuggestions: ATSExperienceTitleSuggestion[];
  experienceTitleOverrides: Record<string, string>;
  isSubmitting: boolean;
  onSelectedTitleChange: (value: string) => void;
  onExperienceTitleChange: (id: string, value: string) => void;
  onBack: () => void;
  onGenerateResume: () => void;
}

const ATSJobTitleReview = ({
  options,
  selectedTitle,
  experienceTitleSuggestions,
  experienceTitleOverrides,
  isSubmitting,
  onSelectedTitleChange,
  onExperienceTitleChange,
  onBack,
  onGenerateResume,
}: ATSJobTitleReviewProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Review Generated Job Titles
        </h3>
        <p className="text-sm text-slate-600">
          Accept one suggestion or edit the title before generating your ATS
          resume.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const isActive = selectedTitle === option.title;
          return (
            <button
              key={`${option.title}-${index}`}
              type="button"
              onClick={() => onSelectedTitleChange(option.title)}
              aria-label={`Use title ${option.title}`}
              className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                isActive
                  ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-800">{option.title}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {option.confidence}% match
                </span>
              </div>
              <p className="text-sm text-slate-600">{option.rationale}</p>
            </button>
          );
        })}
      </div>

      <div>
        <label
          htmlFor="selected-target-title"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Selected Resume Title (Editable)
        </label>
        <input
          id="selected-target-title"
          type="text"
          value={selectedTitle}
          onChange={(event) => onSelectedTitleChange(event.target.value)}
          aria-label="Selected target job title"
          className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
        />
      </div>

      {experienceTitleSuggestions.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Employment Job Titles (JD-Aligned)
            </h3>
            <p className="text-sm text-slate-600">
              Suggested titles are generated for each employment entry. You can
              edit any value manually before generating your resume.
            </p>
          </div>

          <div className="space-y-3">
            {experienceTitleSuggestions.map((suggestion) => {
              const overrideValue =
                experienceTitleOverrides[suggestion.id] || suggestion.suggested_title;
              return (
                <div
                  key={suggestion.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {suggestion.company}
                    </p>
                    <p className="text-xs text-slate-500">
                      {suggestion.current_role} • {suggestion.dates}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{suggestion.rationale}</p>
                  </div>

                  {suggestion.alternate_titles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {suggestion.alternate_titles.map((title, index) => (
                        <button
                          key={`${suggestion.id}-${title}-${index}`}
                          type="button"
                          onClick={() => onExperienceTitleChange(suggestion.id, title)}
                          aria-label={`Use ${title} for ${suggestion.company}`}
                          className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`experience-title-${suggestion.id}`}
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Job Title (Editable)
                    </label>
                    <input
                      id={`experience-title-${suggestion.id}`}
                      type="text"
                      value={overrideValue}
                      onChange={(event) =>
                        onExperienceTitleChange(suggestion.id, event.target.value)
                      }
                      aria-label={`Editable job title for ${suggestion.company}`}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to job details"
          className="px-5 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!selectedTitle.trim() || isSubmitting}
          onClick={onGenerateResume}
          aria-label="Generate ATS resume with selected title"
          className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Generating ATS Resume..." : "Generate ATS Resume"}
        </button>
      </div>
    </div>
  );
};

export default ATSJobTitleReview;
