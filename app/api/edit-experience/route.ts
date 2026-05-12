import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DynamicATSExperience, Experience } from "@/lib/types";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";

interface EditExperienceRequest {
  experience: DynamicATSExperience | Experience;
  instruction: string;
  variant: "ats" | "regular";
}

const SYSTEM_PROMPT = `You are a professional resume editor. You will receive a JSON object representing one job experience entry and a plain-language editing instruction.

Rules:
- Return ONLY valid JSON — no markdown, no code fences, no extra text
- Only modify the "achievements" array (and "summary" string if variant is "regular")
- NEVER change "company", "location", "role", or "dates" fields
- Do not fabricate metrics, tools, or accomplishments not implied by the existing bullets
- Preserve bullet count unless the instruction explicitly asks to add or remove bullets
- Keep all bullet points action-oriented and starting with a strong past-tense verb`;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EditExperienceRequest;
    const { experience, instruction, variant } = body;

    if (!experience || !instruction?.trim()) {
      return NextResponse.json(
        { error: "experience and instruction are required." },
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

    const userMessage = `Here is the experience entry:
${JSON.stringify(experience, null, 2)}

Instruction: ${instruction.trim()}

Return only the updated experience entry as JSON. Follow all rules exactly.`;

    const message = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 1500,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: DynamicATSExperience | Experience;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON. Please try again." },
        { status: 500 }
      );
    }

    // Overwrite factual anchor fields with originals to prevent AI modification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = parsed as any;
    p.company = experience.company;
    p.role = experience.role;
    p.dates = experience.dates;
    p.location = experience.location;

    // Strip summary for ATS variant
    if (variant === "ats") {
      delete p.summary;
    }
    parsed = p as DynamicATSExperience | Experience;

    return NextResponse.json({ experience: parsed });
  } catch (error) {
    console.error("edit-experience error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
