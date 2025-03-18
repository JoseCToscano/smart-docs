import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env.js";

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

// Function to check for repeating patterns in text
function hasRepeatingPattern(text: string, minPatternLength = 10): boolean {
  // Check if the text is long enough to contain repeating patterns
  if (text.length < minPatternLength * 2) return false;
  
  // Take the last N characters and see if they appear earlier in the text
  for (let patternLength = minPatternLength; patternLength < Math.min(100, text.length / 2); patternLength++) {
    const pattern = text.slice(-patternLength);
    const restOfText = text.slice(0, -patternLength);
    
    if (restOfText.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// Track cache hit rate for analytics
let totalRequests = 0;
let cacheHits = 0;

export async function POST(req: NextRequest) {
  try {
    totalRequests++;
    const { text, contextType, style, tone } = await req.json();
    console.log("[API:Autocomplete] Received request with text:", text);
    console.log("[API:Autocomplete] Context information:", { contextType, style, tone });
    
    if (!text) {
      console.log("[API:Autocomplete] Error: Text content is required");
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }
    
    // Check for repeating patterns in the input text
    if (hasRepeatingPattern(text)) {
      console.log("[API:Autocomplete] Detected repeating patterns in input text, skipping completion");
      return NextResponse.json({ completion: '' });
    }

    // Build a contextual instruction based on detected style and tone
    let contextualInstruction = `Context type: ${contextType || 'text'}`;
    
    if (style) {
      contextualInstruction += `\nWriting style: ${style}`;
      
      // Add specific style guidance
      switch(style) {
        case 'academic':
          contextualInstruction += `\nUse an objective, scholarly tone with precise language and formal phrasing.`;
          break;
        case 'technical':
          contextualInstruction += `\nUse clear, precise terminology with a focus on accuracy and technical details.`;
          break;
        case 'business':
          contextualInstruction += `\nUse professional, results-oriented language focused on value and outcomes.`;
          break;
        case 'creative':
          contextualInstruction += `\nMaintain the narrative voice and creative elements present in the text.`;
          break;
      }
    }
    
    if (tone) {
      contextualInstruction += `\nTone: ${tone}`;
      
      // Add specific tone guidance
      switch(tone) {
        case 'formal':
          contextualInstruction += `\nUse authoritative, direct language with proper grammar and structure.`;
          break;
        case 'tentative':
          contextualInstruction += `\nUse measured, thoughtful language that acknowledges nuance and alternatives.`;
          break;
        case 'casual':
          contextualInstruction += `\nUse approachable, conversational language that feels natural and engaging.`;
          break;
        case 'personal':
          contextualInstruction += `\nMaintain the first-person perspective and subjective viewpoint.`;
          break;
      }
    }

    // Using Haiku model for fast, concise text completions
    console.log("[API:Autocomplete] Calling Anthropic API with model: claude-3-haiku-20240307");
    
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100, // Reduced for more concise completions (15-50 words)
      temperature: 0.7, // Slightly more creative for natural writing
      system: [
        // Cache the core instructions and guidelines as they're static across requests
        {
          type: "text",
          text: `You are an AI writing assistant integrated directly into a document editor, designed to help users complete their thoughts and improve their writing in real-time.

Core responsibilities:
- Generate natural, high-quality text completions based on the document context
- Match the user's writing tone, style, and formatting
- Respect the document's existing structure and organization
- Provide completions that are helpful without being intrusive

Guidelines:
- Provide only the completion text without explanations or metadata
- Format your completion to seamlessly blend with the existing text
- Generate 1-3 sentence completions that naturally extend the user's writing
- Completions should be concise but valuable, typically 15-50 words
- Analyze the existing text to match formality level, vocabulary, and sentence structure
- If the text is technical, maintain appropriate terminology and precision
- If the text is creative, maintain the narrative voice and stylistic elements
- Adapt to different document types (academic papers, business reports, creative writing, emails)
- Never complete text in ways that could create harmful or misleading content`,
          cache_control: { type: "ephemeral" }
        },
        // Non-cached specific instructions for this particular request
        {
          type: "text",
          text: `IMPORTANT: DO NOT repeat phrases or sentences that already exist in the input text
IMPORTANT: Ensure your completion avoids circular or repetitive patterns

${contextualInstruction}`
        }
      ],
      messages: [
        {
          role: "user",
          content: `Continue this text with a natural, non-repetitive completion (1-3 sentences, about 15-50 words):\n\n${text}`
        }
      ]
    });

    // Log cache usage statistics
    const cacheCreationTokens = response.usage?.cache_creation_input_tokens || 0;
    const cacheReadTokens = response.usage?.cache_read_input_tokens || 0;
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    
    // Determine if this was a cache hit
    if (cacheReadTokens > 0 && cacheCreationTokens === 0) {
      cacheHits++;
    }
    
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
    
    console.log("[API:Autocomplete] Usage statistics:", {
      cacheCreationTokens,
      cacheReadTokens,
      inputTokens,
      outputTokens,
      totalRequests,
      cacheHits,
      cacheHitRate: `${cacheHitRate.toFixed(2)}%`
    });

    console.log("[API:Autocomplete] Received response from Anthropic API:", {
      id: response.id,
      model: response.model,
      contentType: response.content?.[0]?.type,
      hasContent: Boolean(response.content?.length),
      usage: response.usage,
      cacheUsed: cacheReadTokens > 0
    });

    // Try to extract the completion text using try/catch to handle type issues
    let completion = '';
    try {
      // Access the content directly with a more direct approach
      if (response.content[0]?.type === 'text') {
        // Safely cast to any to avoid TypeScript errors
        const textContent = response.content[0] as any;
        completion = textContent.text || '';
        
        // Clean up the completion - remove quotes if present, trim extra whitespace
        completion = completion.trim();
        if (completion.startsWith('"') && completion.endsWith('"')) {
          completion = completion.slice(1, -1).trim();
        }
        
        // Check if the completion would create a repeating pattern when appended
        const combinedText = text + completion;
        if (hasRepeatingPattern(combinedText)) {
          console.log("[API:Autocomplete] Detected potential repeating pattern in completion, returning empty string");
          completion = '';
        } else {
          console.log("[API:Autocomplete] Extracted completion:", completion);
        }
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