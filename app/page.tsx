"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import JobDescriptionForm from "./components/JobDescriptionForm";
import ResumePreview from "./components/ResumePreview";
import LoadingState from "./components/LoadingState";
import TargetCompanies from "./components/TargetCompanies";
import CoverLetterForm from "./components/CoverLetterForm";
import CoverLetterPreview from "./components/CoverLetterPreview";
import ATSResumeBuilder from "./components/ATSResumeBuilder";
import Toast, { ToastItem, useToast } from "./components/Toast";
import {
  ResumeResponse,
  ErrorResponse,
  APIResponse,
  CandidateData,
} from "@/lib/types";
import { CoverLetterResponse } from "@/app/api/generate-cover-letter/route";
import {
  candidateList,
  getCandidateById,
  candidateData as defaultCandidate,
} from "@/lib/candidateData";

// Dynamically import ApplicationTracker to avoid Supabase initialization during build
const ApplicationTracker = dynamic(
  () => import("./components/ApplicationTracker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
      </div>
    ),
  }
);

type AppState = "input" | "loading" | "result" | "error";
type ActiveView =
  | "tailor"
  | "coverletter"
  | "atsbuilder"
  | "companies"
  | "tracker";

const isErrorResponse = (response: APIResponse): response is ErrorResponse => {
  return "error" in response;
};

const viewTabs: { key: ActiveView; label: string; shortLabel: string }[] = [
  { key: "atsbuilder", label: "ATS Builder", shortLabel: "ATS" },
  { key: "tailor", label: "Resume Tailor", shortLabel: "Resume" },
  { key: "coverletter", label: "Cover Letter", shortLabel: "Letter" },
  { key: "companies", label: "Companies", shortLabel: "Co." },
  { key: "tracker", label: "Tracker", shortLabel: "Track" },
];

const getTabAccent = (view: ActiveView) => {
  switch (view) {
    case "tailor":
      return "bg-amber-500 text-white";
    case "coverletter":
      return "bg-violet-500 text-white";
    case "atsbuilder":
      return "bg-orange-500 text-white";
    case "companies":
      return "bg-emerald-500 text-white";
    case "tracker":
      return "bg-blue-500 text-white";
  }
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [activeView, setActiveView] = useState<ActiveView>("atsbuilder");
  const [resumeData, setResumeData] = useState<ResumeResponse | null>(null);
  const [coverLetterData, setCoverLetterData] =
    useState<CoverLetterResponse | null>(null);
  const [coverLetterCompany, setCoverLetterCompany] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    defaultCandidate.id
  );
  const [lastJobDescription, setLastJobDescription] = useState<string>("");
  const pageLength: 2 | 3 = 2;
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!candidateDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCandidateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [candidateDropdownOpen]);
  const { toasts, addToast, removeToast } = useToast();

  const activeCandidate: CandidateData =
    getCandidateById(activeCandidateId) || defaultCandidate;

  const handleSubmit = async (
    jobDescription: string,
    additionalKeywords?: string[]
  ) => {
    setAppState("loading");
    setErrorMessage("");
    setLastJobDescription(jobDescription);

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          candidateId: activeCandidateId,
          additionalKeywords,
          pageLength,
        }),
      });

      const data: APIResponse = await response.json();

      if (!response.ok || isErrorResponse(data)) {
        const error = isErrorResponse(data)
          ? data.error
          : "An unexpected error occurred";
        setErrorMessage(error);
        setAppState("error");
        addToast(error, "error");
        return;
      }

      setResumeData(data);
      setAppState("result");
      const successMessage = additionalKeywords?.length
        ? `Resume regenerated with ${
            additionalKeywords.length
          } additional keyword${additionalKeywords.length !== 1 ? "s" : ""}!`
        : "Resume tailored successfully!";
      addToast(successMessage, "success");
    } catch (error) {
      console.error("Error:", error);
      const message = "Failed to connect to the server. Please try again.";
      setErrorMessage(message);
      setAppState("error");
      addToast(message, "error");
    }
  };

  const handleReset = () => {
    setAppState("input");
    setResumeData(null);
    setCoverLetterData(null);
    setCoverLetterCompany("");
    setErrorMessage("");
    setLastJobDescription("");
    setIsRegenerating(false);
  };

  const handleRegenerateWithKeywords = async (keywords: string[]) => {
    if (!lastJobDescription) {
      addToast(
        "Unable to regenerate. Please try generating a new resume.",
        "error"
      );
      return;
    }

    setIsRegenerating(true);

    try {
      await handleSubmit(lastJobDescription, keywords);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCoverLetterSubmit = async (
    companyName: string,
    whyThisCompany: string,
    jobDescription: string,
    companyMission?: string
  ) => {
    setAppState("loading");
    setErrorMessage("");
    setCoverLetterCompany(companyName);

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          whyThisCompany,
          jobDescription,
          companyMission,
          candidateId: activeCandidateId,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const error = data.error || "An unexpected error occurred";
        setErrorMessage(error);
        setAppState("error");
        addToast(error, "error");
        return;
      }

      setCoverLetterData(data as CoverLetterResponse);
      setAppState("result");
      addToast("Cover letter generated successfully!", "success");
    } catch (error) {
      console.error("Error:", error);
      const message = "Failed to connect to the server. Please try again.";
      setErrorMessage(message);
      setAppState("error");
      addToast(message, "error");
    }
  };

  const handleCandidateChange = (candidateId: string) => {
    setActiveCandidateId(candidateId);
    setCandidateDropdownOpen(false);
    handleReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const getCandidateInitials = (name: string) => {
    return name
      .replace(/\s*\(.*?\)\s*/g, "")
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getProfileGradient = (professionType: string) => {
    switch (professionType) {
      case "developer":
        return "from-amber-400 to-orange-500";
      case "payroll":
        return "from-emerald-400 to-teal-500";
      case "grc":
        return "from-blue-400 to-indigo-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const cardClass = "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-10";

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          {/* Left: App Name */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-bold">
              R
            </div>
            <span className="text-lg font-semibold text-slate-900 hidden sm:inline">
              Resume AI
            </span>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-3">
            {/* Pill tabs for standard views */}
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {viewTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveView(tab.key);
                    if (tab.key !== "companies" && tab.key !== "tracker") {
                      handleReset();
                    }
                  }}
                  aria-label={`${tab.label} view`}
                  aria-pressed={activeView === tab.key}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    activeView === tab.key
                      ? getTabAccent(tab.key)
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Candidate Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCandidateDropdownOpen(!candidateDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Select candidate"
              aria-expanded={candidateDropdownOpen}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getProfileGradient(
                  activeCandidate.professionType
                )} text-[10px] font-bold text-white`}
              >
                {getCandidateInitials(activeCandidate.name)}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {activeCandidate.name.replace(/\s*\(.*?\)\s*/g, "")}
              </span>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform ${candidateDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {candidateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCandidateDropdownOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                    Candidates
                  </div>
                  {candidateList.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => handleCandidateChange(candidate.id)}
                      onKeyDown={(e) =>
                        handleKeyDown(e, () => handleCandidateChange(candidate.id))
                      }
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        activeCandidateId === candidate.id
                          ? "bg-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getProfileGradient(
                          candidate.professionType
                        )} text-xs font-bold text-white`}
                      >
                        {getCandidateInitials(candidate.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {candidate.name.replace(/\s*\(.*?\)\s*/g, "")}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {candidate.professionalTitle}
                        </p>
                      </div>
                      {activeCandidateId === candidate.id && (
                        <svg className="ml-auto h-4 w-4 shrink-0 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
        {activeView === "tailor" && (
          <>
            {appState === "input" && (
              <div className={cardClass}>
                <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProfileGradient(
                      activeCandidate.professionType
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {getCandidateInitials(activeCandidate.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {activeCandidate.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Your profile is ready to be tailored
                    </p>
                  </div>
                </div>
                <JobDescriptionForm onSubmit={(jd) => handleSubmit(jd)} isLoading={false} />
              </div>
            )}

            {appState === "loading" && (
              <div className={cardClass}>
                <LoadingState />
              </div>
            )}

            {appState === "result" && resumeData && (
              <ResumePreview
                data={resumeData}
                onReset={handleReset}
                onToast={addToast}
                candidate={activeCandidate}
                onRegenerateWithKeywords={handleRegenerateWithKeywords}
                isRegenerating={isRegenerating}
              />
            )}

            {appState === "error" && (
              <div className={cardClass}>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">{errorMessage}</p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors"
                    aria-label="Try again"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "coverletter" && (
          <>
            {appState === "input" && (
              <div className={cardClass}>
                <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProfileGradient(
                      activeCandidate.professionType
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {getCandidateInitials(activeCandidate.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {activeCandidate.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Generate a personalized cover letter
                    </p>
                  </div>
                </div>
                <CoverLetterForm onSubmit={handleCoverLetterSubmit} isLoading={false} />
              </div>
            )}

            {appState === "loading" && (
              <div className={cardClass}>
                <LoadingState />
              </div>
            )}

            {appState === "result" && coverLetterData && (
              <CoverLetterPreview
                data={coverLetterData}
                companyName={coverLetterCompany}
                onReset={handleReset}
                onToast={addToast}
                candidate={activeCandidate}
              />
            )}

            {appState === "error" && (
              <div className={cardClass}>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">{errorMessage}</p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-sm font-semibold text-white bg-violet-500 rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-colors"
                    aria-label="Try again"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "companies" && (
          <div className={cardClass}>
            <TargetCompanies />
          </div>
        )}

        {activeView === "atsbuilder" && <ATSResumeBuilder onToast={addToast} />}

        {activeView === "tracker" && (
          <div className={cardClass}>
            <ApplicationTracker />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        <p>Built with Next.js, Tailwind CSS, and Claude AI</p>
      </footer>

      {/* Toast Notifications */}
      {toasts.map((toast: ToastItem) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </main>
  );
}
