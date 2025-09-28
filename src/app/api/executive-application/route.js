import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const data = await req.json();

    // Get current questions from settings and role
    const db = await connectToDatabase();
    const settings = await db.collection("settings").findOne({});

    // Get role-specific questions
    const selectedRole = await db.collection("executiveRoles").findOne({
      title: data.role,
    });

    // Default questions if none exist
    const defaultQuestions = [
      { id: "why", required: true },
      { id: "fintechVision", required: true },
      { id: "otherCommitments", required: true },
    ];

    // Use role-specific questions if available, otherwise use general questions
    const questions =
      selectedRole?.questions?.length > 0
        ? selectedRole.questions
        : settings?.executiveApplicationQuestions || defaultQuestions;

    // Basic validation for required fields
    const requiredFields = ["name", "email", "program", "year", "role"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate dynamic questions
    const missingQuestions = questions
      .filter((question) => question.required && !data[question.id])
      .map((question) => question.label || question.id);

    if (missingQuestions.length > 0) {
      return NextResponse.json(
        { error: `Missing required questions: ${missingQuestions.join(", ")}` },
        { status: 400 }
      );
    }

    await db.collection("executiveApplications").insertOne({
      ...data,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit executive application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const applications = await db
      .collection("executiveApplications")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch executive applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection("executiveApplications").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete executive application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
