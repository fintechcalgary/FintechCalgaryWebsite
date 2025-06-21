import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const settings = await db.collection("settings").findOne({});

    return NextResponse.json(settings || { executiveApplicationsOpen: false });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { executiveApplicationsOpen } = body;

    // Validate the input
    if (typeof executiveApplicationsOpen !== "boolean") {
      return NextResponse.json(
        { error: "executiveApplicationsOpen must be a boolean" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Update or create settings document
    const result = await db.collection("settings").updateOne(
      {}, // Empty filter to match any document
      {
        $set: { executiveApplicationsOpen },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true } // Create if doesn't exist
    );

    return NextResponse.json({
      success: true,
      executiveApplicationsOpen,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// Catch-all handler for any other HTTP methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
