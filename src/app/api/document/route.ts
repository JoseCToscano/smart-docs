import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";

// Schema for document creation/update
const documentSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string(),
  id: z.string().optional(), // Optional for updates
});

// GET /api/document - Get all documents for the authenticated user
export async function GET(_req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const documents = await db.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        // Don't include content to keep the response size small
      }
    });
    
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

// POST /api/document - Create a new document
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const validatedData = documentSchema.parse(body);
    
    const document = await db.document.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
} 