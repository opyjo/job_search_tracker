import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { COVER_LETTER_SYSTEM_PROMPT, formatCoverLetterUserMessage } from "@/lib/coverLetterPrompt";

export interface CoverLetterParagraphs {
  greeting: string;
  opening_paragraph: string;
  body_paragraph_1: string;
  body_paragraph_2: string;
  closing_paragraph: string;
  signature: string;
}

export interface CoverLetterMetadata {
  tone_used: "conversational" | "professional";
  tone_reason: string;
  key_points_addressed: string[];
  company_specific_mentions: string[];
}

export interface CoverLetterResponse {
  cover_letter: CoverLetterParagraphs;
  metadata: CoverLetterMetadata;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, whyThisCompany, jobDescription, companyMission } = await request.json();

    if (!companyName || typeof companyName !== "string") {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    if (!whyThisCompany || typeof whyThisCompany !== "string") {
      return NextResponse.json(
        { error: "Please tell us why you want to work at this company" },
        { status: 400 }
      );
    }

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

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add ANTHROPIC_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    const userMessage = formatCoverLetterUserMessage(companyName, whyThisCompany, jobDescription, companyMission);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      temperature: 0.4,
      system: COVER_LETTER_SYSTEM_PROMPT,
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

    let parsedResponse: CoverLetterResponse;
    
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      
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
    console.error("Error generating cover letter:", error);
    
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
    
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
