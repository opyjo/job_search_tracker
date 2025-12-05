import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, formatUserMessage } from "@/lib/systemPrompt";
import { formatCandidateExperience } from "@/lib/candidateData";
import { APIResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json();

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
    const userMessage = formatUserMessage(jobDescription, candidateExperience);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract the text content from the response
    const textContent = message.content.find((block) => block.type === "text");
    
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text content in response" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedResponse: APIResponse;
    
    try {
      // Try to extract JSON from the response (in case there's extra text)
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
    console.error("Error generating resume:", error);
    
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

