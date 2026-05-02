import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ATSResumeRequest, DynamicATSResumeResponse } from "@/lib/types";
import {
  generateATSResumeSystemPrompt,
  formatATSResumeUserMessage,
} from "@/lib/atsResumePrompt";
import { ATS_FIXED_PROFILE } from "@/lib/atsFixedProfile";
import { atsResumeProfile, formatATSResumeProfileExperience } from "@/lib/atsResumeProfile";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ATSResumeRequest & { pageLength?: number };
    const trimmedJD = body.jobDescription?.trim();
    const trimmedTitle = body.targetJobTitle?.trim();
    const selectedModel = body.anthropicModel?.trim() || DEFAULT_ANTHROPIC_MODEL;
    const pageLength: 2 | 3 = body.pageLength === 3 ? 3 : 2;

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

    if (!trimmedTitle) {
      return NextResponse.json(
        { error: "Target job title is required." },
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
    const candidateProfile = formatATSResumeProfileExperience();
    const candidateContactLine = [
      ATS_FIXED_PROFILE.name,
      ATS_FIXED_PROFILE.email,
      ATS_FIXED_PROFILE.phone,
      atsResumeProfile.location,
      atsResumeProfile.linkedin,
    ]
      .filter(Boolean)
      .join(" | ");
    const experienceTitleOverridesText =
      body.experienceTitleOverrides && body.experienceTitleOverrides.length > 0
        ? body.experienceTitleOverrides
            .map((override) => `${override.id}: ${override.title}`)
            .join("\n")
        : "None provided.";

    const message = await anthropic.messages.create({
      model: selectedModel,
      max_tokens: pageLength === 3 ? 6000 : 4096,
      temperature: 0.25,
      system: generateATSResumeSystemPrompt(pageLength),
      messages: [
        {
          role: "user",
          content: formatATSResumeUserMessage({
            ...body,
            jobDescription: trimmedJD,
            targetJobTitle: trimmedTitle,
          }, candidateProfile, candidateContactLine, experienceTitleOverridesText),
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
        { error: "Failed to parse ATS resume output." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]) as DynamicATSResumeResponse;
    if (!parsed?.dynamic_resume?.professional_summary) {
      return NextResponse.json(
        { error: "AI returned invalid resume format." },
        { status: 500 }
      );
    }

    // Always enforce the user-confirmed title and fixed profile contact details
    parsed.dynamic_resume.target_job_title = trimmedTitle;
    parsed.dynamic_resume.contact = {
      ...parsed.dynamic_resume.contact,
      name: ATS_FIXED_PROFILE.name,
      email: ATS_FIXED_PROFILE.email,
      phone: ATS_FIXED_PROFILE.phone,
      location: atsResumeProfile.location || parsed.dynamic_resume.contact?.location,
      linkedin: atsResumeProfile.linkedin || parsed.dynamic_resume.contact?.linkedin,
    };

    if (body.experienceTitleOverrides && body.experienceTitleOverrides.length > 0) {
      const normalizeCompany = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, "");

      const roleByCompany = new Map(
        body.experienceTitleOverrides
          .map((override) => {
            const company = atsResumeProfile.experience.find(
              (_, index) => `exp-${index}` === override.id
            )?.company;
            return company && override.title.trim()
              ? [normalizeCompany(company), override.title.trim()]
              : null;
          })
          .filter(Boolean) as Array<[string, string]>
      );

      parsed.dynamic_resume.experience = parsed.dynamic_resume.experience.map((exp) => {
        const normalizedExpCompany = normalizeCompany(exp.company);
        const directMatch = roleByCompany.get(normalizedExpCompany);
        const partialMatch = Array.from(roleByCompany.entries()).find(
          ([key]) =>
            key.includes(normalizedExpCompany) || normalizedExpCompany.includes(key)
        )?.[1];
        const overrideTitle = directMatch || partialMatch;
        if (!overrideTitle) {
          return exp;
        }

        return {
          ...exp,
          role: overrideTitle,
        };
      });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating ATS resume:", error);

    if (error instanceof Anthropic.APIError && error.status === 401) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate ATS resume." },
      { status: 500 }
    );
  }
}
