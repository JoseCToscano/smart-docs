import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import {db} from "@/server/db";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { name, avatar } = data;

    // Update user in database
    const updatedUser = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name: name,
        image: avatar,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 