const { connectToDatabase } = require("./db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedAdmin() {
  try {
    const db = await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ username: "fintechcalgary" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("ucalgary210", 10);

    await db.collection("users").insertOne({
      username: "fintechcalgary",
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
