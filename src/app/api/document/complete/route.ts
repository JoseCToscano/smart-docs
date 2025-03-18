import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.js";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60; // 60 seconds timeout for Edge function

export async function POST(req: NextRequest) {
  try {
    const { prompt, content } = await req.json();

    if (!prompt || !content) {
      return NextResponse.json(
        { error: "Missing required fields: prompt and content" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `
# Document Editing with XML Tags
You are a helpful AI assistant that helps users edit documents based on their requests.

## How to Format Your Response
When making changes to the document, please use these XML tags to mark your edits:
- <addition>added text</addition> - For new text being added
- <deletion>removed text</deletion> - For text being removed

## Response Guidelines:
1. Return the COMPLETE document with XML tags marking changes.
2. Include ALL original text, marking only the changes with XML tags.
3. Do NOT include any explanations, prefixes, or phrases like "Here is the edited document..." before the content.
4. Do NOT include any comments, notes, or explanations after the content.
5. Your response should begin immediately with the complete document content.

## Editing Guidelines:
1. Only use the XML tags for actual changes. Don't wrap unchanged text in tags.
2. Make your edits precise and targeted.
3. Keep the original document structure and maintain the overall formatting.
4. If you're not changing anything, don't use the XML tags.
5. Be careful with formatting - make sure your XML tags don't break existing HTML/markdown.

## Example:
If the original text is "The quick fox jumps over the lazy dog"
And the user asks to replace "fox" with "brown fox" and "lazy" with "sleeping"
Your response should be EXACTLY: "The quick <deletion>fox</deletion> <addition>brown fox</addition> jumps over the <deletion>lazy</deletion> <addition>sleeping</addition> dog"
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Here is my document:
\`\`\`
${content}
\`\`\`

My request:
${prompt}

IMPORTANT: Please return the COMPLETE document with XML tags marking only the changes. Include ALL original text and only use tags for additions and deletions. Do not include any prefixes, explanations, or notes. Your response should start immediately with the full document content.`,
        },
      ],
    });

    console.log("API Response from Claude:", {
      status: "success",
      contentLength: response.content[0]?.type === 'text' ? response.content[0].text.length : 0,
      contentPreview: response.content[0]?.type === 'text' 
        ? response.content[0].text.substring(0, 100) + "..." 
        : "No text content",
    });

    // Get the content from the response safely
    let responseText = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'Unable to process document';
    
    // Remove common prefixes that Claude might add
    const prefixesToRemove = [
      "Here is the edited document with your requested changes:",
      "Here's the edited document with your requested changes:",
      "Here is the document with the changes you requested:",
      "Here's the document with the changes you requested:",
      "I've edited the document according to your request:"
    ];
    
    for (const prefix of prefixesToRemove) {
      if (responseText.trim().startsWith(prefix)) {
        responseText = responseText.trim().substring(prefix.length).trim();
        break;
      }
    }

    console.log("Final processed response:", {
      contentLength: responseText.length,
      contentPreview: responseText.substring(0, 100) + "..."
    });

    return NextResponse.json({
      result: responseText,
    });
  } catch (error) {
    console.error("Error with Anthropic API:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
} 