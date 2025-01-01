const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || process.env.NEXT_MONGODB_URI;
const dbName = "fintech-website";

if (!uri) {
  console.error(
    "No MongoDB URI found. Looking for NEXT_PUBLIC_MONGODB_URI or NEXT_MONGODB_URI"
  );
  process.exit(1);
}

async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(uri);
    console.log("Connected to MongoDB successfully");
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };
