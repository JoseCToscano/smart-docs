import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const { name, email, message, type } = await req.json();

    if (!name || !email || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create feedback entry
    const feedback = await db.feedback.create({
      data: {
        name,
        email,
        message,
        type,
        userId: session?.user?.id || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
} 