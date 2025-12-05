import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { COVER_LETTER_SYSTEM_PROMPT, formatCoverLetterUserMessage } from "@/lib/coverLetterPrompt";
import { formatCandidateExperience } from "@/lib/candidateData";

export interface CoverLetterResponse {
  cover_letter: {
    opening: string;
    body: string;
    company_fit: string;
    closing: string;
  };
  full_text: string;
  customization_notes: {
    company_research_used: string;
    key_achievements_highlighted: string[];
    tone: string;
    suggestions: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, companyName } = await request.json();

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

    const candidateExperience = formatCandidateExperience();
    const userMessage = formatCoverLetterUserMessage(jobDescription, candidateExperience, companyName);

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

