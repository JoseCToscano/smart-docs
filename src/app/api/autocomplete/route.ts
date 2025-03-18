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
    console.log("[API:Autocomplete] Received request with text:", text);
    console.log("[API:Autocomplete] Detected language:", language);
    
    if (!text) {
      console.log("[API:Autocomplete] Error: Text content is required");
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    // Using Haiku model for code completion
    console.log("[API:Autocomplete] Calling Anthropic API with model: claude-3-haiku-20240307");
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

    console.log("[API:Autocomplete] Received response from Anthropic API:", {
      id: response.id,
      model: response.model,
      contentType: response.content?.[0]?.type,
      hasContent: Boolean(response.content?.length)
    });

    // Try to extract the completion text using try/catch to handle type issues
    let completion = '';
    try {
      // Access the content directly with a more direct approach
      if (response.content[0]?.type === 'text') {
        // Safely cast to any to avoid TypeScript errors
        const textContent = response.content[0] as any;
        completion = textContent.text || '';
        console.log("[API:Autocomplete] Extracted completion:", completion);
      } else {
        console.log("[API:Autocomplete] No text content found in response");
      }
    } catch (err) {
      console.error("[API:Autocomplete] Error extracting completion text:", err);
      // Still return an empty completion rather than failing
    }

    console.log("[API:Autocomplete] Returning completion of length:", completion.length);
    return NextResponse.json({ completion });
  } catch (error) {
    console.error("[API:Autocomplete] Autocompletion error:", error);
    return NextResponse.json(
      { error: "Failed to generate autocompletion" },
      { status: 500 }
    );
  }
} 