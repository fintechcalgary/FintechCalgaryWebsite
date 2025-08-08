import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Basic validation
    if (!data.title || !data.responsibilitiesImageUrl) {
      return NextResponse.json(
        { error: "Title and responsibilities image are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection("executiveRoles").insertOne({
      title: data.title,
      responsibilitiesImageUrl: data.responsibilitiesImageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      roleId: result.insertedId,
    });
  } catch (error) {
    console.error("Failed to create executive role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const roles = await db
      .collection("executiveRoles")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Failed to fetch executive roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { id, title, responsibilitiesImageUrl } = data;

    if (!id || !title || !responsibilitiesImageUrl) {
      return NextResponse.json(
        { error: "ID, title, and responsibilities image are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection("executiveRoles").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          responsibilitiesImageUrl,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update executive role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection("executiveRoles").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete executive role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
