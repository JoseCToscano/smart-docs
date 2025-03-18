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
    console.log("Received request with text:", text, language);
    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Using Haiku model for code completion
    // Updated to use messages API instead of completions API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Complete the following ${language || "code"} snippet. Only provide the completion, do not repeat any of the existing code:\n\n${text}`
        }
      ],
      system: "You are a helpful coding assistant. Provide only the code completion without explanations or repeating any existing code."
    });

    // Try to extract the completion text using try/catch to handle type issues
    let completion = '';
    try {
      // Access the content directly with a more direct approach
      if (response.content[0]?.type === 'text') {
        // Safely cast to any to avoid TypeScript errors
        const textContent = response.content[0] as any;
        completion = textContent.text || '';
      }
    } catch (err) {
      console.error("Error extracting completion text:", err);
      // Still return an empty completion rather than failing
    }

    return NextResponse.json({ completion });
  } catch (error) {
    console.error("Autocompletion error:", error);
    return NextResponse.json(
      { error: "Failed to generate autocompletion" },
      { status: 500 }
    );
  }
} 