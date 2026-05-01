import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  generateATSJobTitleSystemPrompt,
  formatATSJobTitleUserMessage,
} from "@/lib/atsResumePrompt";
import { ATSResumeTitleRequest, ATSResumeTitleResponse } from "@/lib/types";
import { atsResumeProfile, formatATSResumeProfileRoles } from "@/lib/atsResumeProfile";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ATSResumeTitleRequest;
    const trimmedJD = body.jobDescription?.trim();
    const selectedModel = body.anthropicModel?.trim() || DEFAULT_ANTHROPIC_MODEL;

    if (!trimmedJD) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    if (trimmedJD.length < 50) {
      return NextResponse.json(
        {
          error:
            "Please provide a full job description (minimum 50 characters).",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: 1500,
      temperature: 0.2,
      system: generateATSJobTitleSystemPrompt(),
      messages: [
        {
          role: "user",
          content: formatATSJobTitleUserMessage({
            ...body,
            jobDescription: trimmedJD,
          }, formatATSResumeProfileRoles()),
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text content returned from AI." },
        { status: 500 }
      );
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse title suggestions." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as ATSResumeTitleResponse;
    if (
      !parsed.recommended_title ||
      !Array.isArray(parsed.title_options) ||
      parsed.title_options.length === 0 ||
      !Array.isArray(parsed.experience_title_suggestions)
    ) {
      return NextResponse.json(
        { error: "AI returned invalid title suggestion format." },
        { status: 500 }
      );
    }

    const fallbackExperienceSuggestions = atsResumeProfile.experience.map(
      (experience, index) => ({
        id: `exp-${index}`,
        company: experience.company,
        dates: experience.dates,
        current_role: experience.role,
        suggested_title: experience.role,
        alternate_titles: [],
        rationale: "Fallback to current role title.",
      })
    );

    parsed.experience_title_suggestions =
      parsed.experience_title_suggestions.length > 0
        ? parsed.experience_title_suggestions.map((suggestion, index) => ({
            id: suggestion.id || `exp-${index}`,
            company:
              suggestion.company || atsResumeProfile.experience[index]?.company || "",
            dates: suggestion.dates || atsResumeProfile.experience[index]?.dates || "",
            current_role:
              suggestion.current_role ||
              atsResumeProfile.experience[index]?.role ||
              "",
            suggested_title:
              suggestion.suggested_title ||
              suggestion.current_role ||
              atsResumeProfile.experience[index]?.role ||
              "",
            alternate_titles: Array.isArray(suggestion.alternate_titles)
              ? suggestion.alternate_titles
              : [],
            rationale:
              suggestion.rationale || "Suggested from job description context.",
          }))
        : fallbackExperienceSuggestions;

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating ATS job titles:", error);

    if (error instanceof Anthropic.APIError && error.status === 401) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate ATS job title suggestions." },
      { status: 500 }
    );
  }
}
