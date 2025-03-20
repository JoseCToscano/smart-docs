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

    // Get count of prompts for current user
    const promptCount = await db.prompt.count({
      where: {
        user_id: userId,
        // Optional: Add date filter if you want to reset counts periodically
        // createdAt: {
        //   gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        // }
      }
    });

    return NextResponse.json({
      total: promptCount,
      remaining: Math.max(0, 15 - promptCount),
      limit: 15
    });

  } catch (error) {
    console.error("Error getting prompt count:", error);
    return NextResponse.json(
      { error: "Failed to get prompt count" },
      { status: 500 }
    );
  }
} 