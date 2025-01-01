const { connectToDatabase } = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedAdmin() {
  try {
    const db = await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ email: "admin@admin.com" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("abc123", 10);

    await db.collection("users").insertOne({
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin:", error);
  } finally {
    process.exit();
  }
}

seedAdmin();
