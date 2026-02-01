/**
 * Upload partner logos from public/partners to Cloudinary and update partner documents.
 * Run after seed-partners.js from project root: node src/scripts/upload-partner-logos.js
 * Requires: MONGODB URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
const path = require("path");
const fs = require("fs");
const projectRoot = path.resolve(__dirname, "../..");
const envPath = path.join(projectRoot, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config();
}
const { connectToDatabase } = require("./db");
const cloudinary = require("cloudinary").v2;

const PARTNERS_COLLECTION = "partners";
const CLOUDINARY_FOLDER = "partner-logos";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function resolveLogoPath(logoUrl) {
  if (!logoUrl || !logoUrl.startsWith("/partners/")) return null;
  const relativePath = logoUrl.slice(1); // "partners/ucalgary.png"
  return path.join(projectRoot, "public", relativePath);
}

async function uploadLogo(filePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        overwrite: true,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
  });
}

async function uploadSponsorLogos() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error(
      "Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
    process.exit(1);
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection(PARTNERS_COLLECTION);
    const partners = await collection
      .find({ logo: { $regex: "^/partners/" } })
      .toArray();

    if (partners.length === 0) {
      console.log(
        "No partners with local /partners/ logos found. Already migrated or run seed-partners.js first."
      );
      process.exit(0);
      return;
    }

    console.log(`Found ${partners.length} partner(s) with local logos.`);

    for (const partner of partners) {
      const filePath = resolveLogoPath(partner.logo);
      if (!filePath || !fs.existsSync(filePath)) {
        console.warn(
          `File not found for ${partner.name}: ${partner.logo} (resolved: ${filePath})`
        );
        continue;
      }

      try {
        const secureUrl = await uploadLogo(filePath);
        await collection.updateOne(
          { _id: partner._id },
          { $set: { logo: secureUrl, updatedAt: new Date() } }
        );
        console.log(`Uploaded logo for: ${partner.name}`);
      } catch (err) {
        console.error(`Failed to upload logo for ${partner.name}:`, err.message);
      }
    }

    console.log("Done.");
  } catch (error) {
    console.error("Error uploading partner logos:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

uploadSponsorLogos();
