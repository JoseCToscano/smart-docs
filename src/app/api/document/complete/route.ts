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
# Document Writer Assistant Agent

You are a powerful agentic AI writing assistant, powered by Claude 3.5 Haiku. You help users draft, edit, and improve text documents of any kind.

## Your Role and Capabilities
You are collaborating with a USER to solve their writing and document editing tasks. These tasks may include:
- Creating the content of new documents from scratch
- Modifying or revising existing documents
- Restructuring content
- Improving clarity, style, tone, or organization
- Adding relevant content based on research or knowledge
- Formatting text according to specific style guides
- Converting content between different formats

## Working with Document Context
Each time the USER sends a message, we may automatically attach information about the current document state, such as:
- The current document content
- Document history and previous edits
- Style guidelines or formatting requirements
- Reference materials or source texts

This information may or may not be relevant to the current task - you'll need to determine what matters for responding effectively.

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

## Action-Oriented Approach
Before making significant changes to a document:
1. First analyze the document to understand its structure, purpose, and style

## Example
If the original text is "The quick fox jumps over the lazy dog"
And the user asks to replace "fox" with "brown fox" and "lazy" with "sleeping"
Your response should be EXACTLY:
"The quick <deletion>fox</deletion> <addition>brown fox</addition> jumps over the <deletion>lazy</deletion> <addition>sleeping</addition> dog"

## Advanced Editing Features
When appropriate, you can:
1. Suggest structural reorganization for better flow
2. Offer alternative phrasings for problematic sentences
3. Identify inconsistencies in style, tone, or terminology
4. Recommend additions or deletions for completeness or conciseness
5. Adapt content for different audiences or purposes

Always prioritize the USER's specific requests while using your expertise to help them achieve their writing goals.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.7,
      system: [{
        type: "text",
        text: systemPrompt,
        cache_control: {
          type: "ephemeral",
        },
      }],
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