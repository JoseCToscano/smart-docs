import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env.js";

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Using Haiku model for code completion
    const completion = await anthropic.completions.create({
      model: "claude-3-haiku-20240307",
      max_tokens_to_sample: 1000,
      prompt: `<human>Complete the following ${language || "code"} snippet. Only provide the completion, do not repeat any of the existing code:
${text}</human>
<assistant>`,
    });

    return NextResponse.json({ completion: completion.completion });
  } catch (error) {
    console.error("Autocompletion error:", error);
    return NextResponse.json(
      { error: "Failed to generate autocompletion" },
      { status: 500 }
    );
  }
} 