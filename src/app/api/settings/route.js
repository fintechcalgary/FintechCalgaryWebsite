import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const settings = await db.collection("settings").findOne({});

    // Default questions if none exist
    const defaultQuestions = [
      {
        id: "why",
        label: "Why do you want to be an executive?",
        placeholder:
          "Please share your motivation for joining the executive team...",
        required: true,
      },
      {
        id: "fintechVision",
        label:
          "What does 'fintech' mean to you, and how do you see its role in the future of business and innovation?",
        placeholder:
          "Please share your understanding of fintech and your vision for its future...",
        required: true,
      },
      {
        id: "otherCommitments",
        label:
          "Are you currently involved with any other clubs or commitments? How do you plan to balance your responsibilities?",
        placeholder:
          "Please describe your current commitments and how you plan to manage your time...",
        required: true,
      },
    ];

    return NextResponse.json(
      settings || {
        executiveApplicationsOpen: false,
        executiveApplicationQuestions: defaultQuestions,
      }
    );
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
    const { executiveApplicationsOpen, executiveApplicationQuestions } = body;

    // Validate the input
    if (
      executiveApplicationsOpen !== undefined &&
      typeof executiveApplicationsOpen !== "boolean"
    ) {
      return NextResponse.json(
        { error: "executiveApplicationsOpen must be a boolean" },
        { status: 400 }
      );
    }

    // Validate questions if provided
    if (executiveApplicationQuestions !== undefined) {
      if (!Array.isArray(executiveApplicationQuestions)) {
        return NextResponse.json(
          { error: "executiveApplicationQuestions must be an array" },
          { status: 400 }
        );
      }

      // Validate each question
      for (const question of executiveApplicationQuestions) {
        if (!question.id || !question.label) {
          return NextResponse.json(
            { error: "Each question must have an id and label" },
            { status: 400 }
          );
        }
      }
    }

    const db = await connectToDatabase();

    // Build update object
    const updateData = {};
    if (executiveApplicationsOpen !== undefined) {
      updateData.executiveApplicationsOpen = executiveApplicationsOpen;
    }
    if (executiveApplicationQuestions !== undefined) {
      updateData.executiveApplicationQuestions = executiveApplicationQuestions;
    }

    // Update or create settings document
    const result = await db.collection("settings").updateOne(
      {}, // Empty filter to match any document
      {
        $set: updateData,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true } // Create if doesn't exist
    );

    return NextResponse.json({
      success: true,
      ...updateData,
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
