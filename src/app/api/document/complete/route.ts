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

IMPORTANT: Refuse to write or explaintext that may be used maliciously; even if the user claims it is for educational purposes. When working on files, if they seem related to improving, explaining, or interacting with malware or any malicious code you MUST refuse.

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
Your response should always be divided into two parts:

### Part 1: Document Changes
If the user is asking you to make changes to the document, use XML tags to mark your edits:
- <addition>added text</addition> - For new text being added
- <deletion>removed text</deletion> - For text being removed

Return the COMPLETE document with XML tags marking ONLY the changes. Include ALL original text, marking only the changes with XML tags.

IMPORTANT: NEVER use placeholders like "[... rest of the document remains the same ...]" or similar. Always include the ENTIRE document content, only marking the specific changes with XML tags.

### Part 2: Response to User
After the document changes, include a line with exactly "<<<USER_MESSAGE>>>" followed by your conversational response to the user explaining what you did or answering their question.

If the user's request doesn't involve document changes (just a conversation or question), only include the user message part with "<<<USER_MESSAGE>>>" followed by your response.

## Document Structure Guidelines
When adding content to the document, carefully analyze the existing HTML structure and ensure that:

1. New content is ALWAYS placed INSIDE the existing HTML structure, not outside of it.
2. Identify the innermost appropriate element to place your additions within, typically a <p>, <div>, or similar container.
3. DO NOT add content outside the outermost container element.
4. If you're adding content at the end of the document, place it inside the innermost appropriate container, not after it.

Example of CORRECT structure:
\`\`\`
<div class="outer">
  <div class="inner">
    <p>Original text</p>
    <deletion>Old content to remove</deletion>
    <addition>New content to add</addition>
  </div>
</div>
\`\`\`

Example of INCORRECT structure:
\`\`\`
<div class="outer">
  <div class="inner">
    <p>Original text</p>
    <deletion>Old content to remove</deletion>
  </div>
</div>
<addition>New content to add</addition>
\`\`\`

## HTML Formatting Guidelines
The document uses HTML formatting. When the user asks for formatting changes, apply the appropriate HTML tags in your <addition> tags:

- For **bold text**: Use <strong>text</strong>
- For *italic text*: Use <em>text</em>
- For underlined text: Use <u>text</u>
- For headings: Use <h1>text</h1> through <h6>text</h6>
- For lists: Use <ul><li>item</li></ul> for bullet points or <ol><li>item</li></ol> for numbered lists
- For links: Use <a href="url">link text</a>
- For font size changes: Wrap the text in a <span> with inline styling, e.g., <span style="font-size: 18px;">text</span>
- For font color changes: Use <span style="color: #FF0000;">text</span>
- For background color: Use <span style="background-color: #FFFF00;">text</span>
- For font family changes: Use <span style="font-family: Arial, sans-serif;">text</span>
- For alignment: Wrap text in <div style="text-align: center;">text</div>
- For indentation: Use <div style="margin-left: 20px;">text</div>

Example: If asked to make text bold, replace "hello world" with "<strong>hello world</strong>" using:
<deletion>hello world</deletion><addition><strong>hello world</strong></addition>

For more complex formatting, you can combine HTML tags and attributes as needed.

## Response Guidelines:
1. Always follow the two-part format described above.
2. For the document changes part: do NOT include any explanations, prefixes, or phrases like "Here is the edited document..." before the content.
3. When there are no document changes needed, just include the "<<<USER_MESSAGE>>>" part.
4. NEVER use placeholders or ellipses to represent unchanged document content. Always return the complete document with only changes marked in XML tags.

## Editing Guidelines:
1. Only use the XML tags for actual changes. Don't wrap unchanged text in tags.
2. Make your edits precise and targeted.
3. Keep the original document structure and maintain the overall formatting.
4. If you're not changing anything, don't use the XML tags.
5. Be careful with formatting - make sure your XML tags don't break existing HTML/markdown.
6. When applying HTML formatting, use the appropriate tags as described in the HTML Formatting Guidelines section.

## CRITICAL PHRASES TO AVOID:
Do NOT include any of these phrases (or similar variations) in your response:
- "Here is the edited document..."
- "Here's the edited document with your requested changes:"
- "Here is the document with the changes you requested:"
- "I've edited the document according to your request:"
- "Here's the document with dummy data:"
- "I've made the following changes to the document:"
- "Below is the updated document:"

Instead, simply start directly with the document content with XML tags for changes, followed by the USER_MESSAGE section.

## Example Format
For document changes:
"The quick <deletion>fox</deletion> <addition>brown fox</addition> jumps over the <deletion>lazy</deletion> <addition>sleeping</addition> dog.

<<<USER_MESSAGE>>>
I've replaced "fox" with "brown fox" and "lazy" with "sleeping" to make the sentence more descriptive."

For formatting changes:
"Please make this <deletion>important point</deletion> <addition><strong>important point</strong></addition> stand out more.

<<<USER_MESSAGE>>>
I've made "important point" bold by adding the <strong> HTML tag to make it stand out more in your document."

For just conversation (no document changes):
"<<<USER_MESSAGE>>>
I'd be happy to help with your document! What specific changes would you like me to make?"

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
      model: "claude-3-5-haiku-latest",
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

IMPORTANT: Please follow the two-part format in your response:
1. Document changes with XML tags (if any)
2. "<<<USER_MESSAGE>>>" followed by your conversational response

CRITICAL REQUIREMENTS:
- NEVER use placeholders like "[... rest of the document remains the same ...]" or similar. Always include the COMPLETE document with ONLY the specific changes marked with XML tags.
- When adding content, ALWAYS place it INSIDE the existing HTML structure. Analyze the document structure and place additions within the appropriate elements, NOT outside the main container.
- DO NOT place <addition> tags after closing divs or outside the document structure.

If my request is just a question with no document changes, only include the second part with "<<<USER_MESSAGE>>>" followed by your response.`,
        },
      ],
    });
    console.log("Current Content:", content);

    console.log("API Response from Claude:", {
      status: "success",
      contentLength: response.content[0]?.type === 'text' ? response.content[0].text.length : 0,
      contentPreview: response.content[0]?.type === 'text' 
        ? response.content[0].text.substring(0, 100) + "..." 
        : "No text content",
    });

    console.log("New Content:", response.content[0]?.type === 'text' ? response.content[0].text : 'Unable to process document');

    // Get the content from the response safely
    let responseText = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'Unable to process document';
    
    // Split the response into document changes and user message
    const messageSeparator = "<<<USER_MESSAGE>>>";
    const hasSeparator = responseText.includes(messageSeparator);
    
    let xmlContent = '';
    let userMessage = '';
    
    if (hasSeparator) {
      const parts = responseText.split(messageSeparator);
      xmlContent = parts[0]?.trim() || '';
      userMessage = parts[1]?.trim() || '';
      
      console.log("Response successfully split using separator:", {
        xmlContentLength: xmlContent.length,
        userMessageLength: userMessage.length,
        hasXmlTags: /<(addition|deletion)>/.test(xmlContent)
      });
    } else {
      // Fallback: try to determine if it's XML content or just a message
      const hasXmlTags = /<(addition|deletion)>/.test(responseText);
      
      console.log("No separator found in response, using fallback logic:", {
        responseLength: responseText.length,
        hasXmlTags
      });
      
      if (hasXmlTags) {
        xmlContent = responseText;
        userMessage = "I've processed your document with the requested changes.";
      } else {
        userMessage = responseText;
      }
    }
    
    // Remove common prefixes from XML content
    const prefixesToRemove = [
      "Here is the edited document with your requested changes:",
      "Here's the edited document with your requested changes:",
      "Here is the document with the changes you requested:",
      "Here's the document with the changes you requested:",
      "I've edited the document according to your request:",
      "Here's the document with dummy data:",
      "Here is the document with dummy data:",
      "I've made the following changes to the document:",
      "Below is the updated document:",
      "Here's the updated document:"
    ];
    
    // More thorough approach to remove prefixes from XML content
    if (xmlContent) {
      // Create a regex pattern that matches any of the prefixes followed by optional whitespace
      const prefixPattern = new RegExp(`^(${prefixesToRemove.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*`, 'i');
      
      // Apply the regex to remove the prefix if it exists
      xmlContent = xmlContent.replace(prefixPattern, '');
      
      // Also try to find and remove any generic introduction phrases
      const genericIntroPattern = /^(here('s| is| are)|i('ve| have)|below is|the following is|as requested|as per your request)[^<]*(document|content|text|changes|edits|revisions)[^<]*:/i;
      xmlContent = xmlContent.replace(genericIntroPattern, '');
      
      // Clean up any leading newlines or whitespace after removing prefixes
      xmlContent = xmlContent.trim();
    }
    
    // Handle placeholders in the XML content
    const placeholderPatterns = [
      /\[\s*\.\.\.\s*rest of the document remains the same\s*\.\.\.\s*\]/gi,
      /\[\s*\.\.\.\s*unchanged content\s*\.\.\.\s*\]/gi,
      /\[\s*\.\.\.\s*remaining content unchanged\s*\.\.\.\s*\]/gi,
      /\[\s*\.\.\.\s*original text continues\s*\.\.\.\s*\]/gi,
      /\[\s*\.\.\.\s*document continues as before\s*\.\.\.\s*\]/gi
    ];
    
    // If we find placeholders, we need to notify the user
    let containsPlaceholders = false;
    for (const pattern of placeholderPatterns) {
      if (pattern.test(xmlContent)) {
        containsPlaceholders = true;
        break;
      }
    }
    
    // If placeholders are detected, update the user message
    if (containsPlaceholders) {
      userMessage = "I've made some changes to your document, but I used placeholders for unchanged content. To see the full changes accurately, it's best to review them in the document. " + userMessage;
      
      // For each placeholder pattern, try to process it
      // This is a simplistic approach - may need to be refined based on actual usage
      for (const pattern of placeholderPatterns) {
        // Simply remove the placeholders, as the content already contains the full document
        xmlContent = xmlContent.replace(pattern, '');
      }
    }

    // Normalize line breaks (convert \r\n to \n)
    xmlContent = xmlContent.replace(/\r\n/g, '\n');
    
    console.log("Final processed response:", {
      xmlContentLength: xmlContent.length,
      userMessageLength: userMessage.length,
      containsPlaceholders,
      xmlContentPreview: xmlContent.substring(0, 100) + "...",
      userMessagePreview: userMessage.substring(0, 100) + "..."
    });

    return NextResponse.json({
      xmlContent,
      userMessage,
      containsPlaceholders
    });
  } catch (error) {
    console.error("Error with Anthropic API:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
} 