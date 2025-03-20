import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";

// Schema for document title update
const documentTitleSchema = z.object({
  title: z.string().min(1).max(255),
});

// PATCH /api/document/[id]/title - Update only a document's title
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // First check if the document exists and belongs to the user
    const existingDocument = await db.document.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      select: { id: true },
    });
    
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    const body = await req.json();
    const validatedData = documentTitleSchema.parse(body);
    
    const updatedDocument = await db.document.update({
      where: {
        id: params.id,
      },
      data: {
        title: validatedData.title,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    console.error("Error updating document title:", error);
    return NextResponse.json({ error: "Failed to update document title" }, { status: 500 });
  }
} 