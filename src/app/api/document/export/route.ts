import { NextRequest, NextResponse } from 'next/server';
import HTMLtoDOCX from 'html-to-docx';

// Constants for unit conversion
const MM_TO_TWIPS = 56.7; // 1mm = 56.7 twips
const PX_TO_INCHES = 0.0104166667; // 1px = 1/96 inches

interface ExportRequest {
  content: string;
  title: string;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: {
    width: number;  // in millimeters
    height: number; // in millimeters
  };
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, margins, pageSize } = await req.json() as ExportRequest;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Convert page size from millimeters to twips
    const pageSizeTwips = {
      width: Math.round(pageSize.width * MM_TO_TWIPS),
      height: Math.round(pageSize.height * MM_TO_TWIPS)
    };

    // Convert margins from pixels to inches
    const marginInches = {
      top: margins.top * PX_TO_INCHES,
      right: margins.right * PX_TO_INCHES,
      bottom: margins.bottom * PX_TO_INCHES,
      left: margins.left * PX_TO_INCHES,
    };

    // Convert HTML to DOCX with proper page size and margins
    const docxBuffer = await HTMLtoDOCX(content, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      font: 'Calibri',
      margins: marginInches,
      pageSize: {
        width: pageSizeTwips.width,
        height: pageSizeTwips.height
      },
      title: title,
      creator: 'SmartDocs',
      description: 'Document exported from SmartDocs',
      keywords: ['smartdocs', 'document'],
      lastModifiedBy: 'SmartDocs Export',
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