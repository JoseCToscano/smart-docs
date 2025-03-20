import { NextRequest, NextResponse } from 'next/server';
import HTMLtoDOCX from 'html-to-docx';

export async function POST(req: NextRequest) {
  try {
    const { content, title, margins } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Convert HTML to DOCX
    const docxBuffer = await HTMLtoDOCX(content, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: 'Calibri',
      margins: {
        top: margins.top * 0.0393701, // Convert px to inches (1 inch = 96px)
        right: margins.right * 0.0393701,
        bottom: margins.bottom * 0.0393701,
        left: margins.left * 0.0393701,
      },
    });

    // Return the buffer as a blob
    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title || 'document'}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 });
  }
} 