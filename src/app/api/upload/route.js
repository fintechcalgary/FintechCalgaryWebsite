import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const folder = data.get("folder"); // currently optional but eventually migrate to folder structure

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadOptions = {
      resource_type: "auto",
      format: "jpg",
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    // Upload to Cloudinary with format conversion
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          resolve(result);
        })
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
