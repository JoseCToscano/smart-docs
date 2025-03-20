import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

// 
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PATCH, params:", params);
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pageSize, margins } = await request.json();
    
    // Validate the input
    if (!pageSize || !margins) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the document and verify ownership
    const document = await db.document.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || document.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the document with new page settings
    const updatedDocument = await db.document.update({
      where: { id: params.id },
      data: {
        pageSize,
        margins,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        pageSize: true,
        margins: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[PAGE_SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 