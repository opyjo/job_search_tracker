"use client";

import { useState } from "react";
import { InterviewPrepResponse } from "@/app/api/generate-interview-prep/route";

interface InterviewPrepPreviewProps {
  data: InterviewPrepResponse;
  companyName: string;
  onReset: () => void;
  onToast: (message: string, type: "success" | "error" | "info") => void;
}

type Section = "projects" | "questions" | "themes" | "tips";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "projects", label: "Matched Projects" },
  { key: "questions", label: "Interview Questions" },
  { key: "themes", label: "Key Themes" },
  { key: "tips", label: "Prep Tips" },
];

const relevanceBadge = (score: "high" | "medium" | "low") => {
  const styles = {
    high: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[score]}`}>
      {score}
    </span>
  );
};

const questionTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    behavioral: "bg-purple-100 text-purple-700",
    technical: "bg-blue-100 text-blue-700",
    situational: "bg-orange-100 text-orange-700",
    culture: "bg-pink-100 text-pink-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || "bg-slate-100 text-slate-600"}`}>
      {type}
    </span>
  );
};

const InterviewPrepPreview = ({ data, companyName, onReset, onToast }: InterviewPrepPreviewProps) => {
  const [activeSection, setActiveSection] = useState<Section>("projects");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const copyTalkingPoints = async () => {
    const lines: string[] = [];
    lines.push(`INTERVIEW TALKING POINTS${companyName ? ` — ${companyName}` : ""}`);
    lines.push(`Role: ${data.metadata.role_detected}`);
    lines.push("=".repeat(50));

    for (const project of data.matched_projects) {
      lines.push("");
      lines.push(`## ${project.project_name} [${project.relevance_score}]`);
      lines.push(project.why_relevant);
      project.talking_points.forEach((tp, i) => lines.push(`  ${i + 1}. ${tp}`));
      lines.push(`  Tech: ${project.technologies_to_highlight.join(", ")}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      onToast("Talking points copied to clipboard!", "success");
    } catch {
      onToast("Failed to copy to clipboard", "error");
    }
  };

  const copyQASheet = async () => {
    const lines: string[] = [];
    lines.push(`INTERVIEW Q&A SHEET${companyName ? ` — ${companyName}` : ""}`);
    lines.push(`Role: ${data.metadata.role_detected}`);
    lines.push("=".repeat(50));

    data.interview_questions.forEach((q, i) => {
      lines.push("");
      lines.push(`Q${i + 1}. [${q.question_type}] ${q.question}`);
      lines.push("");
      lines.push(`Answer: ${q.suggested_answer}`);
      lines.push("");
      lines.push("Key Points:");
      q.key_points.forEach((kp) => lines.push(`  - ${kp}`));
      lines.push("-".repeat(40));
    });

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      onToast("Q&A sheet copied to clipboard!", "success");
    } catch {
      onToast("Failed to copy to clipboard", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Interview Prep{companyName ? ` — ${companyName}` : ""}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {data.metadata.role_detected} &middot; Style: {data.metadata.interview_style_guess}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyTalkingPoints}
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              Copy All Talking Points
            </button>
            <button
              onClick={copyQASheet}
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              Copy Q&A Sheet
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1 rounded-full bg-slate-100 p-1 w-fit">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeSection === section.key
                ? "bg-teal-500 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Matched Projects */}
      {activeSection === "projects" && (
        <div className="space-y-4">
          {data.matched_projects.map((project, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-semibold text-slate-800">{project.project_name}</h3>
                {relevanceBadge(project.relevance_score)}
              </div>
              <p className="text-sm text-slate-600 mb-4">{project.why_relevant}</p>
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Talking Points</h4>
                <ol className="space-y-1.5">
                  {project.talking_points.map((tp, j) => (
                    <li key={j} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-teal-500 font-semibold shrink-0">{j + 1}.</span>
                      {tp}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies_to_highlight.map((tech, j) => (
                  <span key={j} className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview Questions */}
      {activeSection === "questions" && (
        <div className="space-y-3">
          {data.interview_questions.map((q, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full p-5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-400 font-mono text-sm shrink-0 mt-0.5">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {questionTypeBadge(q.question_type)}
                  </div>
                  <p className="text-sm font-medium text-slate-800">{q.question}</p>
                </div>
                <svg
                  className={`h-5 w-5 text-slate-400 shrink-0 transition-transform ${expandedQuestions.has(i) ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedQuestions.has(i) && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggested Answer</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{q.suggested_answer}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Points</h4>
                    <ul className="space-y-1">
                      {q.key_points.map((kp, j) => (
                        <li key={j} className="text-sm text-slate-600 flex gap-2">
                          <span className="text-teal-500 mt-1 shrink-0">&#8226;</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Key Themes */}
      {activeSection === "themes" && (
        <div className="space-y-4">
          {data.key_themes.map((theme, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{theme.theme}</h3>
              <p className="text-sm text-slate-600 mb-4">{theme.why_this_matters}</p>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Proof Points</h4>
                <ul className="space-y-1.5">
                  {theme.proof_points.map((pp, j) => (
                    <li key={j} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-teal-500 mt-1 shrink-0">&#8226;</span>
                      {pp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prep Tips */}
      {activeSection === "tips" && (
        <div className="space-y-4">
          {/* Top Keywords */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.metadata.top_keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Interview Style */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Expected Interview Style</h3>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              data.metadata.interview_style_guess === "behavioral"
                ? "bg-purple-100 text-purple-700"
                : data.metadata.interview_style_guess === "technical"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {data.metadata.interview_style_guess}
            </span>
          </div>

          {/* Preparation Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Preparation Tips</h3>
            <ul className="space-y-2">
              {data.metadata.preparation_tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-3">
                  <span className="text-teal-500 font-semibold shrink-0">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPreview;
