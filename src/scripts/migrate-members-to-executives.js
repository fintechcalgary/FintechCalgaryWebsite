const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI || process.env.NEXT_MONGODB_URI;
const dbName = "fintech-website";

if (!uri) {
  console.error(
    "No MongoDB URI found. Looking for MONGODB_URI, NEXT_PUBLIC_MONGODB_URI, or NEXT_MONGODB_URI"
  );
  process.exit(1);
}

async function migrateMembersToExecutives() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(uri, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      w: "majority",
    });
    
    await client.connect();
    console.log("Connected to MongoDB successfully");
    
    const db = client.db(dbName);
    
    // Check if members collection exists
    const collections = await db.listCollections().toArray();
    const membersCollectionExists = collections.some(col => col.name === "members");
    const executivesCollectionExists = collections.some(col => col.name === "executives");
    
    if (!membersCollectionExists) {
      console.log("⚠️  'members' collection does not exist. Nothing to migrate.");
      return;
    }
    
    if (executivesCollectionExists) {
      console.log("⚠️  'executives' collection already exists. Please backup or remove it before running this migration.");
      console.log("   To proceed, you can manually drop the 'executives' collection and run this script again.");
      return;
    }
    
    // Get all documents from members collection
    const members = await db.collection("members").find({}).toArray();
    console.log(`Found ${members.length} document(s) in 'members' collection`);
    
    if (members.length === 0) {
      console.log("No documents to migrate. Dropping empty 'members' collection...");
      await db.collection("members").drop();
      console.log("✅ Migration complete: Empty 'members' collection dropped");
      return;
    }
    
    // Insert all documents into executives collection
    console.log("Migrating documents to 'executives' collection...");
    const result = await db.collection("executives").insertMany(members);
    console.log(`✅ Successfully migrated ${result.insertedCount} document(s) to 'executives' collection`);
    
    // Verify the migration
    const executivesCount = await db.collection("executives").countDocuments();
    console.log(`✅ Verification: 'executives' collection now contains ${executivesCount} document(s)`);
    
    if (executivesCount === members.length) {
      // Drop the old members collection
      console.log("Dropping old 'members' collection...");
      await db.collection("members").drop();
      console.log("✅ Successfully dropped 'members' collection");
      console.log("\n🎉 Migration completed successfully!");
      console.log(`   - Migrated ${members.length} document(s) from 'members' to 'executives'`);
      console.log("   - Deleted 'members' collection");
    } else {
      console.error("❌ Error: Document count mismatch!");
      console.error(`   Expected: ${members.length}, Found: ${executivesCount}`);
      console.error("   Migration aborted. 'members' collection preserved.");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Run the migration
migrateMembersToExecutives()
  .then(() => {
    console.log("\nMigration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

