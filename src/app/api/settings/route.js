import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

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

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToDatabase();
    const updates = await req.json();

    // Validate the updates
    if (typeof updates.executiveApplicationsOpen !== "boolean") {
      return NextResponse.json(
        { error: "Invalid executiveApplicationsOpen value" },
        { status: 400 }
      );
    }

    // Upsert settings (create if doesn't exist, update if exists)
    const result = await db.collection("settings").updateOne(
      {}, // empty filter to match any document
      { $set: updates },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
