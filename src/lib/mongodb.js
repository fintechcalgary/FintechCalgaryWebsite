// lib/mongodb.js
import { MongoClient } from "mongodb";

let client;
let clientPromise;

console.log(
  "🔌 MongoDB connection setup - URI available:",
  !!process.env.MONGODB_URI
);

if (!global._mongoClientPromise) {
  console.log("🔄 Creating new MongoDB client connection...");
  client = new MongoClient(process.env.MONGODB_URI, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
    w: "majority",
  });
  global._mongoClientPromise = client.connect();
  console.log("✅ MongoDB client connection promise created");
}
clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    console.log("🔗 Connecting to MongoDB database...");
    const client = await clientPromise;
    const db = client.db("fintech-website");
    console.log("✅ Successfully connected to fintech-website database");
    return db;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}
