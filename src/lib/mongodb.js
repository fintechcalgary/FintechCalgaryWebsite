// lib/mongodb.js
import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGODB_URI, {
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    retryWrites: true,
    w: "majority",
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db("fintech-website");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
