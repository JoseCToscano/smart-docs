import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user data including premium status and prompt count
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        _count: {
          select: { prompts: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const promptCount = user._count.prompts;

    return NextResponse.json({
      total: promptCount,
      remaining: Math.max(0, 15 - promptCount),
      limit: 15,
      isPremium: user.isPremium
    });

  } catch (error) {
    console.error("Error getting prompt count:", error);
    return NextResponse.json(
      { error: "Failed to get prompt count" },
      { status: 500 }
    );
  }
} 