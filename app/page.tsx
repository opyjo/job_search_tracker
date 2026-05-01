"use client";

import { useState } from "react";
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
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

interface ViewTheme {
  active: string;
  inactive: string;
}

const isErrorResponse = (response: APIResponse): response is ErrorResponse => {
  return "error" in response;
};

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [activeView, setActiveView] = useState<ActiveView>("tailor");
  const [resumeData, setResumeData] = useState<ResumeResponse | null>(null);
  const [coverLetterData, setCoverLetterData] =
    useState<CoverLetterResponse | null>(null);
  const [coverLetterCompany, setCoverLetterCompany] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [activeCandidateId, setActiveCandidateId] = useState<string>(
    defaultCandidate.id
  );
  const [lastJobDescription, setLastJobDescription] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
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
    handleReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };


  // Get candidate initials for avatar
  const getCandidateInitials = (name: string) => {
    return name
      .replace(/\s*\(.*?\)\s*/g, "")
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Get gradient colors based on profession type
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

  const getViewTheme = (view: Exclude<ActiveView, "atsbuilder">): ViewTheme => {
    switch (view) {
      case "tailor":
        return {
          active: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
          inactive:
            "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-100",
        };
      case "coverletter":
        return {
          active: "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm",
          inactive:
            "text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100",
        };
      case "companies":
        return {
          active: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
          inactive:
            "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100",
        };
      case "tracker":
        return {
          active: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm",
          inactive:
            "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100",
        };
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#fbbf24_0,_transparent_30%),radial-gradient(circle_at_top_right,_#fb7185_0,_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#312e81_100%)]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="mb-8 grid overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:grid-cols-[320px_1fr]">
          <button
            onClick={() => {
              setActiveView("atsbuilder");
              handleReset();
            }}
            onKeyDown={(e) =>
              handleKeyDown(e, () => {
                setActiveView("atsbuilder");
                handleReset();
              })
            }
            aria-label="Open ATS Resume Builder"
            aria-pressed={activeView === "atsbuilder"}
            tabIndex={0}
            className={`order-1 flex flex-col justify-between p-6 text-left transition-all duration-300 lg:order-2 lg:p-10 ${
              activeView === "atsbuilder"
                ? "bg-gradient-to-br from-amber-400/30 via-orange-500/20 to-rose-500/10"
                : "hover:bg-white/5"
            }`}
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                Featured Tool
              </div>
              <div className="mb-4 flex items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 ${
                  activeView === "atsbuilder"
                    ? "bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 shadow-orange-500/40"
                    : "bg-gradient-to-br from-amber-400/60 to-orange-500/60 shadow-orange-500/20"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16h8M8 12h8m-8-4h8m4 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                    ATS Resume Builder
                  </h1>
                  <p className="mt-1 text-sm font-medium text-amber-100/80">
                    AI-powered, job-description driven
                  </p>
                </div>
              </div>
              <p className="max-w-xl text-base leading-7 text-slate-200 lg:text-lg">
                Paste a job description — AI generates tailored titles, rewrites your experience
                roles to match the JD, and exports a clean ATS-ready document.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {["Job-title suggestions", "Per-role title editing", "Word & PDF export", "ATS score"].map((feat) => (
                <span
                  key={feat}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                >
                  {feat}
                </span>
              ))}
            </div>
            <div className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 self-start ${
              activeView === "atsbuilder"
                ? "bg-white text-orange-600 shadow-lg"
                : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30 hover:from-amber-500 hover:to-orange-600"
            }`}>
              {activeView === "atsbuilder" ? "Currently active" : "Open Builder →"}
            </div>
          </button>

          <div className="order-2 border-t border-white/10 bg-slate-950/35 p-4 lg:order-1 lg:border-r lg:border-t-0 lg:p-5">
            <div className="mb-5 space-y-3 text-left">
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Choose workspace</p>
                <p className="text-xs text-slate-300">
                  ATS builder first, then switch profiles or tools when needed.
                </p>
              </div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                Modern AI workflow
              </div>
            </div>

            {/* Candidate Selector */}
            <div className="grid gap-3">
              {candidateList.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleCandidateChange(candidate.id)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => handleCandidateChange(candidate.id))
                  }
                  aria-label={`Select ${candidate.name}`}
                  aria-pressed={activeCandidateId === candidate.id}
                  tabIndex={0}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200
                            ${
                              activeCandidateId === candidate.id
                                ? `bg-gradient-to-r ${getProfileGradient(
                                    candidate.professionType
                                  )} border-white/30 text-white shadow-lg shadow-black/10`
                                : "border-white/10 bg-white/10 text-slate-100 hover:bg-white/15"
                            }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold
                                ${
                                  activeCandidateId === candidate.id
                                    ? "bg-white/20 text-white"
                                    : `bg-gradient-to-br ${getProfileGradient(
                                        candidate.professionType
                                      )} text-white`
                                }`}
                  >
                    {getCandidateInitials(candidate.name)}
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        activeCandidateId === candidate.id
                          ? "text-white"
                          : "text-slate-100"
                      }`}
                    >
                      {candidate.name.replace(/\s*\(.*?\)\s*/g, "")}
                    </p>
                    <p
                      className={`text-xs ${
                        activeCandidateId === candidate.id
                          ? "text-white/80"
                          : "text-slate-300"
                      }`}
                    >
                      {candidate.professionalTitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/30 p-2 sm:grid-cols-2 lg:grid-cols-1">
            <button
              onClick={() => {
                setActiveView("tailor");
                handleReset();
              }}
              onKeyDown={(e) =>
                handleKeyDown(e, () => {
                  setActiveView("tailor");
                  handleReset();
                })
              }
              aria-label="Resume Tailor view"
              aria-pressed={activeView === "tailor"}
              tabIndex={0}
              {...(() => {
                const theme = getViewTheme("tailor");
                return {
                  className: `justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeView === "tailor" ? theme.active : theme.inactive
                  }`,
                };
              })()}
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span className="hidden sm:inline">Resume Tailor</span>
              <span className="sm:hidden">Resume</span>
            </button>
            <button
              onClick={() => {
                setActiveView("coverletter");
                handleReset();
              }}
              onKeyDown={(e) =>
                handleKeyDown(e, () => {
                  setActiveView("coverletter");
                  handleReset();
                })
              }
              aria-label="Cover Letter view"
              aria-pressed={activeView === "coverletter"}
              tabIndex={0}
              {...(() => {
                const theme = getViewTheme("coverletter");
                return {
                  className: `justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeView === "coverletter"
                      ? theme.active
                      : theme.inactive
                  }`,
                };
              })()}
            >
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">Cover Letter</span>
              <span className="sm:hidden">Letter</span>
            </button>
            <button
              onClick={() => setActiveView("companies")}
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveView("companies"))
              }
              aria-label="Target Companies view"
              aria-pressed={activeView === "companies"}
              tabIndex={0}
              {...(() => {
                const theme = getViewTheme("companies");
                return {
                  className: `justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeView === "companies"
                      ? theme.active
                      : theme.inactive
                  }`,
                };
              })()}
            >
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="hidden sm:inline">Target Companies</span>
              <span className="sm:hidden">Companies</span>
            </button>
            <button
              onClick={() => setActiveView("tracker")}
              onKeyDown={(e) =>
                handleKeyDown(e, () => setActiveView("tracker"))
              }
              aria-label="Application Tracker view"
              aria-pressed={activeView === "tracker"}
              tabIndex={0}
              {...(() => {
                const theme = getViewTheme("tracker");
                return {
                  className: `justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    activeView === "tracker" ? theme.active : theme.inactive
                  }`,
                };
              })()}
            >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="hidden sm:inline">Application Tracker</span>
              <span className="sm:hidden">Tracker</span>
            </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl">
          {activeView === "tailor" && (
            <>
              {appState === "input" && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
                  {/* Candidate info badge */}
                  <div
                    className={`flex items-center gap-3 mb-8 p-4 rounded-xl border
                                ${
                                  activeCandidate.professionType === "developer"
                                    ? "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"
                                    : activeCandidate.professionType === "grc"
                                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                }`}
                  >
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

                  <JobDescriptionForm
                    onSubmit={handleSubmit}
                    isLoading={false}
                  />
                </div>
              )}

              {appState === "loading" && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
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
                      className="px-6 py-3 text-sm font-semibold text-white
                               bg-gradient-to-r from-amber-500 to-orange-500
                               rounded-xl shadow-lg shadow-amber-500/25
                               hover:from-amber-600 hover:to-orange-600
                               focus:outline-none focus:ring-4 focus:ring-amber-300
                               transition-all duration-200"
                      aria-label="Try again"
                      tabIndex={0}
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
                  {/* Candidate info badge */}
                  <div
                    className={`flex items-center gap-3 mb-8 p-4 rounded-xl border
                                ${
                                  activeCandidate.professionType === "developer"
                                    ? "bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200"
                                    : activeCandidate.professionType === "grc"
                                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                }`}
                  >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      activeCandidate.professionType === "developer"
                        ? "from-violet-400 to-purple-500"
                        : activeCandidate.professionType === "grc"
                          ? "from-blue-400 to-indigo-500"
                          : "from-emerald-400 to-teal-500"
                    } flex items-center justify-center text-white font-bold`}
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
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
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
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
                      className="px-6 py-3 text-sm font-semibold text-white
                               bg-gradient-to-r from-violet-500 to-purple-500
                               rounded-xl shadow-lg shadow-violet-500/25
                               hover:from-violet-600 hover:to-purple-600
                               focus:outline-none focus:ring-4 focus:ring-violet-300
                               transition-all duration-200"
                      aria-label="Try again"
                      tabIndex={0}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === "companies" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
              <TargetCompanies />
            </div>
          )}

          {activeView === "atsbuilder" && <ATSResumeBuilder onToast={addToast} />}

          {activeView === "tracker" && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
              <ApplicationTracker />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-slate-500">
          <p>Built with Next.js, Tailwind CSS, and Claude AI</p>
        </footer>
      </div>

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
