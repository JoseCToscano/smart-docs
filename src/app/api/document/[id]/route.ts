import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";

// Schema for document updates
const documentUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
});

// GET /api/document/[id] - Get a specific document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const id = (await params).id;
    const document = await db.document.findUnique({
      where: {
        id,
        userId: session.user.id, // Ensure the document belongs to the user
      },
    });
    
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}


// PUT /api/document/[id] - Update a document
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // First check if the document exists and belongs to the user
    const id = (await params).id;
    const existingDocument = await db.document.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });
    
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    const body = await req.json();
    const validatedData = documentUpdateSchema.parse(body);
    
    const updatedDocument = await db.document.update({
      where: {
        id,
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

// DELETE /api/document/[id] - Delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // First check if the document exists and belongs to the user
    const id = (await params).id;
    const existingDocument = await db.document.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      select: { id: true },
    });
    
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    await db.document.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
} 