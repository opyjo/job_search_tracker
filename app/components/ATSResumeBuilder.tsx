"use client";

import { useEffect, useState } from "react";
import ATSResumeBuilderForm from "./ATSResumeBuilderForm";
import ATSJobTitleReview from "./ATSJobTitleReview";
import DynamicATSResumePreview from "./DynamicATSResumePreview";
import LoadingState from "./LoadingState";
import {
  ATSExperienceTitleSuggestion,
  AnthropicModelOption,
  ATSResumeRequest,
  ATSResumeTitleRequest,
  ATSResumeTitleResponse,
  DynamicATSResumeResponse,
} from "@/lib/types";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";

type ATSBuilderState = "input" | "titleReview" | "loading" | "result" | "error";

interface ATSResumeBuilderProps {
  onToast: (message: string, type: "success" | "error" | "info") => void;
}

const ATSResumeBuilder = ({ onToast }: ATSResumeBuilderProps) => {
  const [state, setState] = useState<ATSBuilderState>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastFormValues, setLastFormValues] =
    useState<ATSResumeTitleRequest | null>(null);
  const [titleOptions, setTitleOptions] =
    useState<ATSResumeTitleResponse["title_options"]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [experienceTitleSuggestions, setExperienceTitleSuggestions] = useState<
    ATSExperienceTitleSuggestion[]
  >([]);
  const [experienceTitleOverrides, setExperienceTitleOverrides] = useState<
    Record<string, string>
  >({});
  const [modelOptions, setModelOptions] = useState<AnthropicModelOption[]>([
    { id: DEFAULT_ANTHROPIC_MODEL, displayName: DEFAULT_ANTHROPIC_MODEL },
  ]);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_ANTHROPIC_MODEL);
  const [resumeData, setResumeData] = useState<DynamicATSResumeResponse | null>(
    null
  );
  const [pageLength, setPageLength] = useState<2 | 3>(2);
  const [includeCertifications, setIncludeCertifications] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch("/api/anthropic-models");
        const data = (await response.json()) as { models?: AnthropicModelOption[] };
        if (!response.ok || !data.models || data.models.length === 0) {
          return;
        }
        const resolvedModels = data.models;
        setModelOptions(resolvedModels);
        setSelectedModel((previousModel) =>
          resolvedModels.some((model) => model.id === previousModel)
            ? previousModel
            : resolvedModels[0].id
        );
      } catch {
        // Keep fallback default model option.
      }
    };

    loadModels();
  }, []);

  const handleGenerateTitles = async (values: ATSResumeTitleRequest) => {
    const payloadValues: ATSResumeTitleRequest = {
      ...values,
      anthropicModel: selectedModel,
    };

    setState("loading");
    setErrorMessage("");
    setLastFormValues(payloadValues);

    try {
      const response = await fetch("/api/generate-ats-job-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadValues),
      });
      const data = (await response.json()) as ATSResumeTitleResponse & {
        error?: string;
      };

      if (!response.ok || data.error) {
        const message = data.error || "Failed to generate title suggestions.";
        setErrorMessage(message);
        setState("error");
        onToast(message, "error");
        return;
      }

      setTitleOptions(data.title_options);
      setSelectedTitle(data.recommended_title);
      setExperienceTitleSuggestions(data.experience_title_suggestions || []);
      setExperienceTitleOverrides(
        (data.experience_title_suggestions || []).reduce<Record<string, string>>(
          (acc, suggestion) => {
            acc[suggestion.id] = suggestion.suggested_title;
            return acc;
          },
          {}
        )
      );
      setState("titleReview");
      onToast("Job title suggestions generated from your job description.", "success");
    } catch {
      const message = "Failed to connect to the server. Please try again.";
      setErrorMessage(message);
      setState("error");
      onToast(message, "error");
    }
  };

  const handleGenerateResume = async () => {
    if (!lastFormValues || !selectedTitle.trim()) {
      const message = "Please select or enter a valid target job title.";
      setErrorMessage(message);
      setState("error");
      onToast(message, "error");
      return;
    }

    setState("loading");
    setErrorMessage("");

    const payload = {
      ...lastFormValues,
      targetJobTitle: selectedTitle.trim(),
      experienceTitleOverrides: experienceTitleSuggestions.map((suggestion) => ({
        id: suggestion.id,
        title:
          experienceTitleOverrides[suggestion.id]?.trim() ||
          suggestion.suggested_title,
      })),
      pageLength,
    };

    try {
      const response = await fetch("/api/generate-ats-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as DynamicATSResumeResponse & {
        error?: string;
      };

      if (!response.ok || data.error) {
        const message = data.error || "Failed to generate ATS resume.";
        setErrorMessage(message);
        setState("error");
        onToast(message, "error");
        return;
      }

      setResumeData(data);
      setState("result");
      onToast("ATS resume generated from your job description.", "success");
    } catch {
      const message = "Failed to connect to the server. Please try again.";
      setErrorMessage(message);
      setState("error");
      onToast(message, "error");
    }
  };

  const handleRegenerateWithKeywords = async (keywords: string[]) => {
    if (!lastFormValues || !selectedTitle.trim()) return;

    setIsRegenerating(true);

    const payload = {
      ...lastFormValues,
      targetJobTitle: selectedTitle.trim(),
      experienceTitleOverrides: experienceTitleSuggestions.map((suggestion) => ({
        id: suggestion.id,
        title:
          experienceTitleOverrides[suggestion.id]?.trim() ||
          suggestion.suggested_title,
      })),
      pageLength,
      additionalKeywords: keywords,
    };

    try {
      const response = await fetch("/api/generate-ats-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as DynamicATSResumeResponse & {
        error?: string;
      };

      if (!response.ok || data.error) {
        const message = data.error || "Failed to regenerate ATS resume.";
        onToast(message, "error");
        return;
      }

      setResumeData(data);
      onToast(
        `Resume regenerated with ${keywords.length} additional keyword${keywords.length !== 1 ? "s" : ""}.`,
        "success"
      );
    } catch {
      onToast("Failed to connect to the server. Please try again.", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleReset = () => {
    setState("input");
    setErrorMessage("");
    setLastFormValues(null);
    setTitleOptions([]);
    setSelectedTitle("");
    setExperienceTitleSuggestions([]);
    setExperienceTitleOverrides({});
    setResumeData(null);
  };

  const handleExperienceTitleChange = (id: string, value: string) => {
    setExperienceTitleOverrides((prev) => ({ ...prev, [id]: value }));
  };

  const handleBackToForm = () => {
    setState("input");
    setErrorMessage("");
  };

  if (state === "loading") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
        <LoadingState />
      </div>
    );
  }

  if (state === "result" && resumeData) {
    return (
      <DynamicATSResumePreview
        data={resumeData}
        onBackToForm={handleBackToForm}
        onReset={handleReset}
        onToast={onToast}
        onRegenerateWithKeywords={handleRegenerateWithKeywords}
        isRegenerating={isRegenerating}
      />
    );
  }

  if (state === "error") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            {lastFormValues && titleOptions.length > 0 && (
              <button
                onClick={() => setState("titleReview")}
                aria-label="Back to title review"
                tabIndex={0}
                className="px-5 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleReset}
              aria-label="Start over"
              tabIndex={0}
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-200"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 lg:p-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          ATS Resume Builder
        </h2>
        <p className="text-slate-600">
          Paste a job description. Titles are generated from the job
          description — accept or edit the suggestion, then build your ATS
          resume.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Generated from your job description. Nothing is fabricated — only what
          you provide is used.
        </p>
      </div>

      {state === "input" && (
        <ATSResumeBuilderForm
          isLoading={false}
          modelOptions={modelOptions}
          selectedModel={selectedModel}
          onSelectedModelChange={setSelectedModel}
          initialValues={lastFormValues}
          pageLength={pageLength}
          onPageLengthChange={setPageLength}
          includeCertifications={includeCertifications}
          onIncludeCertificationsChange={setIncludeCertifications}
          onSubmit={handleGenerateTitles}
        />
      )}

      {state === "titleReview" && (
        <ATSJobTitleReview
          options={titleOptions}
          selectedTitle={selectedTitle}
          experienceTitleSuggestions={experienceTitleSuggestions}
          experienceTitleOverrides={experienceTitleOverrides}
          isSubmitting={false}
          onSelectedTitleChange={setSelectedTitle}
          onExperienceTitleChange={handleExperienceTitleChange}
          onBack={() => setState("input")}
          onGenerateResume={handleGenerateResume}
        />
      )}
    </div>
  );
};

export default ATSResumeBuilder;
