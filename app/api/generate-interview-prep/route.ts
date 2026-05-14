import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateInterviewPrepSystemPrompt, formatInterviewPrepUserMessage } from "@/lib/interviewPrepPrompt";
import { getCandidateById, candidateData as defaultCandidate } from "@/lib/candidateData";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";

export interface InterviewPrepResponse {
  matched_projects: {
    project_name: string;
    relevance_score: "high" | "medium" | "low";
    why_relevant: string;
    talking_points: string[];
    technologies_to_highlight: string[];
  }[];
  interview_questions: {
    question: string;
    question_type: "behavioral" | "technical" | "situational" | "culture";
    suggested_answer: string;
    key_points: string[];
  }[];
  key_themes: {
    theme: string;
    why_this_matters: string;
    proof_points: string[];
  }[];
  metadata: {
    role_detected: string;
    company_detected: string;
    top_keywords: string[];
    interview_style_guess: "behavioral" | "technical" | "mixed";
    preparation_tips: string[];
  };
}

export const maxDuration = 300; // Allow up to 5 minutes for this route

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, companyName, candidateId } = await request.json();

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    if (jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description seems too short. Please paste the full job posting." },
        { status: 400 }
      );
    }

    const candidate = candidateId ? getCandidateById(candidateId) : defaultCandidate;

    if (!candidate) {
      return NextResponse.json(
        { error: "Invalid candidate ID" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey, timeout: 4 * 60 * 1000 });

    const systemPrompt = generateInterviewPrepSystemPrompt(candidate);
    const userMessage = formatInterviewPrepUserMessage(jobDescription.trim(), companyName?.trim());

    const message = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 4096,
      temperature: 0.4,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");

    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text content in response" },
        { status: 500 }
      );
    }

    let parsedResponse: InterviewPrepResponse;

    try {
      // Strip markdown fences if present (```json ... ```)
      const cleaned = textContent.text.replace(/```(?:json)?\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("Failed to parse response:", textContent.text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error generating interview prep:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 400) {
        const errorMessage = String(error.message || "");
        if (errorMessage.includes("credit balance")) {
          return NextResponse.json(
            { error: "Anthropic API credit balance is too low. Please add credits at https://console.anthropic.com/settings/billing" },
            { status: 400 }
          );
        }
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your ANTHROPIC_API_KEY." },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    if (error instanceof Anthropic.APIConnectionError) {
      return NextResponse.json(
        { error: "Connection to AI service failed. Please check your network and try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
