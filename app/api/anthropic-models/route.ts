import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_ANTHROPIC_MODEL } from "@/lib/anthropicModels";
import { AnthropicModelOption } from "@/lib/types";

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      models: [{ id: DEFAULT_ANTHROPIC_MODEL, displayName: DEFAULT_ANTHROPIC_MODEL }],
    });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const modelsPage = await anthropic.models.list();
    const modelMap = new Map<string, AnthropicModelOption>();

    for await (const model of modelsPage) {
      modelMap.set(model.id, {
        id: model.id,
        displayName: model.display_name || model.id,
      });
    }

    const models = Array.from(modelMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    if (models.length === 0) {
      return NextResponse.json({
        models: [{ id: DEFAULT_ANTHROPIC_MODEL, displayName: DEFAULT_ANTHROPIC_MODEL }],
      });
    }

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({
      models: [{ id: DEFAULT_ANTHROPIC_MODEL, displayName: DEFAULT_ANTHROPIC_MODEL }],
    });
  }
}
