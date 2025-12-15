"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import JobDescriptionForm from "./components/JobDescriptionForm";
import ResumePreview from "./components/ResumePreview";
import LoadingState from "./components/LoadingState";
import TargetCompanies from "./components/TargetCompanies";
import CoverLetterForm from "./components/CoverLetterForm";
import CoverLetterPreview from "./components/CoverLetterPreview";
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
type ActiveView = "tailor" | "coverletter" | "companies" | "tracker";

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

  const viewDescriptions: Record<ActiveView, string> = {
    tailor:
      "Paste a job description and get a tailored resume optimized for ATS systems and human recruiters.",
    coverletter:
      "Generate a personalized cover letter tailored to the company and role.",
    companies:
      "Your curated list of target companies organized by priority and interview difficulty.",
    tracker:
      "Track your job applications, interview stages, and follow-up dates all in one place.",
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
    return professionType === "developer"
      ? "from-amber-400 to-orange-500"
      : "from-emerald-400 to-teal-500";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-100/10 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-amber-700 to-orange-600 bg-clip-text text-transparent">
              Resume Tailor AI
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-6">
            {viewDescriptions[activeView]}
          </p>

          {/* Candidate Selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 border border-white gap-2">
              {candidateList.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleCandidateChange(candidate.id)}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => handleCandidateChange(candidate.id))
                  }
                  aria-label={`Select ${candidate.name}`}
                  aria-selected={activeCandidateId === candidate.id}
                  tabIndex={0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200
                            ${
                              activeCandidateId === candidate.id
                                ? `bg-gradient-to-r ${getProfileGradient(
                                    candidate.professionType
                                  )} text-white shadow-md`
                                : "text-slate-600 hover:bg-slate-100"
                            }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
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
                          : "text-slate-800"
                      }`}
                    >
                      {candidate.name.replace(/\s*\(.*?\)\s*/g, "")}
                    </p>
                    <p
                      className={`text-xs ${
                        activeCandidateId === candidate.id
                          ? "text-white/80"
                          : "text-slate-500"
                      }`}
                    >
                      {candidate.professionalTitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl flex-wrap justify-center gap-1">
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
              aria-selected={activeView === "tailor"}
              tabIndex={0}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                        ${
                          activeView === "tailor"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
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
              aria-selected={activeView === "coverletter"}
              tabIndex={0}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                        ${
                          activeView === "coverletter"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
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
              aria-selected={activeView === "companies"}
              tabIndex={0}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                        ${
                          activeView === "companies"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
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
              aria-selected={activeView === "tracker"}
              tabIndex={0}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2
                        ${
                          activeView === "tracker"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-600 hover:text-slate-800"
                        }`}
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
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
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
                                    : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                                }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                        activeCandidate.professionType === "developer"
                          ? "from-violet-400 to-purple-500"
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
