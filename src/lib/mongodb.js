// lib/mongodb.js
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGODB_URI;

function createClient() {
  if (!MONGO_URI) throw new Error("MONGODB_URI environment variable is not set");
  return new MongoClient(MONGO_URI, {
    retryWrites: true,
    w: "majority",
    serverSelectionTimeoutMS: 10000,
  });
}

// Cache connection but allow retry if the previous promise rejected
if (!global._mongoClient) {
  global._mongoClient = createClient();
  global._mongoClientPromise = global._mongoClient.connect();
}

// If the cached promise rejected, create a fresh client and retry once
global._mongoClientPromise = global._mongoClientPromise.catch(() => {
  global._mongoClient = createClient();
  global._mongoClientPromise = global._mongoClient.connect();
  return global._mongoClientPromise;
});

export async function connectToDatabase() {
  try {
    const client = await global._mongoClientPromise;
    return client.db("fintech-website");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
