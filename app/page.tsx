"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import JobDescriptionForm from "./components/JobDescriptionForm";
import ResumePreview from "./components/ResumePreview";
import LoadingState from "./components/LoadingState";
import TargetCompanies from "./components/TargetCompanies";
import CoverLetterForm from "./components/CoverLetterForm";
import CoverLetterPreview from "./components/CoverLetterPreview";
import InterviewPrepForm from "./components/InterviewPrepForm";
import InterviewPrepPreview from "./components/InterviewPrepPreview";
import ATSResumeBuilder from "./components/ATSResumeBuilder";
import Toast, { ToastItem, useToast } from "./components/Toast";
import {
  ResumeResponse,
  ErrorResponse,
  APIResponse,
  CandidateData,
} from "@/lib/types";
import { CoverLetterResponse } from "@/app/api/generate-cover-letter/route";
import { InterviewPrepResponse } from "@/app/api/generate-interview-prep/route";
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
  },
);

type AppState = "input" | "loading" | "result" | "error";
type ActiveView =
  | "tailor"
  | "coverletter"
  | "interview"
  | "atsbuilder"
  | "companies"
  | "tracker";

const isErrorResponse = (response: APIResponse): response is ErrorResponse => {
  return "error" in response;
};

type ViewTab = { key: ActiveView; label: string; shortLabel: string };

/** ATS + Interview Prep: paired navigation segment */
const viewTabsAtsInterview: ViewTab[] = [
  { key: "atsbuilder", label: "ATS Builder", shortLabel: "ATS" },
  { key: "interview", label: "Interview Prep", shortLabel: "Prep" },
];

const viewTabsResumeDocs: ViewTab[] = [
  { key: "tailor", label: "Resume Tailor", shortLabel: "Resume" },
  { key: "coverletter", label: "Cover Letter", shortLabel: "Letter" },
];

const viewTabsTracking: ViewTab[] = [
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
    case "interview":
      return "bg-teal-500 text-white";
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
  const [interviewPrepData, setInterviewPrepData] =
    useState<InterviewPrepResponse | null>(null);
  const [interviewPrepCompany, setInterviewPrepCompany] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    defaultCandidate.id,
  );
  const [lastJobDescription, setLastJobDescription] = useState<string>("");
  const pageLength: 2 | 3 = 2;
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!candidateDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
    additionalKeywords?: string[],
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
    setInterviewPrepData(null);
    setInterviewPrepCompany("");
    setErrorMessage("");
    setLastJobDescription("");
    setIsRegenerating(false);
  };

  const handleRegenerateWithKeywords = async (keywords: string[]) => {
    if (!lastJobDescription) {
      addToast(
        "Unable to regenerate. Please try generating a new resume.",
        "error",
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
    companyMission?: string,
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

  const handleInterviewPrepSubmit = async (
    jobDescription: string,
    companyName?: string,
  ) => {
    setAppState("loading");
    setErrorMessage("");
    setInterviewPrepCompany(companyName || "");

    try {
      const response = await fetch("/api/generate-interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          companyName,
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

      setInterviewPrepData(data as InterviewPrepResponse);
      setAppState("result");
      addToast("Interview prep materials generated!", "success");
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

  const cardClass =
    "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-10";

  const handleTabSelect = (tab: ViewTab) => {
    setActiveView(tab.key);
    if (
      tab.key !== "companies" &&
      tab.key !== "tracker" &&
      tab.key !== activeView
    ) {
      handleReset();
    }
  };

  const renderSegmentedTab = (tab: ViewTab) => {
    const isActive = activeView === tab.key;
    return (
      <button
        key={tab.key}
        type="button"
        onClick={() => handleTabSelect(tab)}
        aria-label={`${tab.label} view`}
        aria-pressed={isActive}
        tabIndex={0}
        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
          isActive
            ? `${getTabAccent(tab.key)} shadow-sm`
            : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
        }`}
      >
        <span className="hidden md:inline">{tab.label}</span>
        <span className="md:hidden">{tab.shortLabel}</span>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {/* Top Navigation Bar */}
      <nav
        className="sticky top-0 z-50 border-b border-slate-200/90 bg-white backdrop-blur-md"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 py-3 sm:justify-between lg:px-8">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1 pr-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white ring-1 ring-slate-900/10">
              R
            </div>
            <span className="hidden text-base font-semibold text-slate-900 sm:inline">
              Resume AI
            </span>
          </div>

          {/* Toolbar: ATS + Prep paired, then documents, then tracking */}
          <div
            className="order-3 flex min-w-0 w-full shrink-0 justify-center sm:order-0 sm:flex-1 sm:w-auto lg:justify-center lg:px-4"
            role="toolbar"
            aria-label="Workspace sections"
          >
            <div className="inline-flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-slate-200 bg-slate-100/80 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="shrink-0 rounded-full border border-dashed border-slate-300/90 bg-white p-0.5 shadow-sm">
                <span className="sr-only">ATS resume and interview prep</span>
                <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-slate-50 px-0.5 py-0.5">
                  {viewTabsAtsInterview.map((tab) => renderSegmentedTab(tab))}
                </div>
              </div>
              <span
                className="h-7 w-px shrink-0 bg-slate-300/80"
                aria-hidden
              />
              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/90 px-0.5 py-0.5 shadow-sm ring-1 ring-slate-200/90">
                {viewTabsResumeDocs.map((tab) => renderSegmentedTab(tab))}
              </div>
              <span
                className="h-7 w-px shrink-0 bg-slate-300/80"
                aria-hidden
              />
              <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/90 px-0.5 py-0.5 shadow-sm ring-1 ring-slate-200/90">
                {viewTabsTracking.map((tab) => renderSegmentedTab(tab))}
              </div>
            </div>
          </div>

          {/* Right: Candidate Selector Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setCandidateDropdownOpen(!candidateDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Select candidate"
              aria-expanded={candidateDropdownOpen}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getProfileGradient(
                  activeCandidate.professionType,
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
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
                        handleKeyDown(e, () =>
                          handleCandidateChange(candidate.id),
                        )
                      }
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        activeCandidateId === candidate.id
                          ? "bg-slate-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getProfileGradient(
                          candidate.professionType,
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
                        <svg
                          className="ml-auto h-4 w-4 shrink-0 text-slate-900"
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
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-10 lg:py-12">
        {activeView === "tailor" && (
          <>
            {appState === "input" && (
              <div className={cardClass}>
                <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProfileGradient(
                      activeCandidate.professionType,
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
                <JobDescriptionForm
                  onSubmit={(jd) => handleSubmit(jd)}
                  isLoading={false}
                />
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {errorMessage}
                  </p>
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
                      activeCandidate.professionType,
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
                <CoverLetterForm
                  onSubmit={handleCoverLetterSubmit}
                  isLoading={false}
                />
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {errorMessage}
                  </p>
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

        {activeView === "interview" && (
          <>
            {appState === "input" && (
              <div className={cardClass}>
                <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${getProfileGradient(
                      activeCandidate.professionType,
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {getCandidateInitials(activeCandidate.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {activeCandidate.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Prepare for your interview
                    </p>
                  </div>
                </div>
                <InterviewPrepForm
                  onSubmit={handleInterviewPrepSubmit}
                  isLoading={false}
                />
              </div>
            )}

            {appState === "loading" && (
              <div className={cardClass}>
                <LoadingState
                  title="Preparing Interview Materials"
                  subtitle="Analyzing the job description, matching your projects, and generating tailored talking points..."
                  steps={[
                    "Analyzing job requirements",
                    "Matching your projects",
                    "Generating interview questions",
                    "Building talking points",
                  ]}
                />
              </div>
            )}

            {appState === "result" && interviewPrepData && (
              <InterviewPrepPreview
                data={interviewPrepData}
                companyName={interviewPrepCompany}
                onReset={handleReset}
                onToast={addToast}
              />
            )}

            {appState === "error" && (
              <div className={cardClass}>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Something went wrong
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    {errorMessage}
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-sm font-semibold text-white bg-teal-500 rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors"
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
