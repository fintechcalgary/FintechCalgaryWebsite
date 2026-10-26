const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri =
  process.env.MONGODB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  process.env.NEXT_MONGODB_URI;
const dbName = "fintech-website";

let client;

if (!uri) {
  console.error(
    "No MongoDB URI found. Set MONGODB_URI, NEXT_PUBLIC_MONGODB_URI, or NEXT_MONGODB_URI",
  );
  process.exit(1);
}

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(uri);
    console.log("Connected to MongoDB successfully");
    return client.db(dbName);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
  }
}

module.exports = { connectToDatabase, closeDatabase };
