/**
 * Seed staff users for each RBAC role.
 * Usage: node src/scripts/seed-staff-roles.js
 */
require("dotenv").config({ path: ".env.local" });
const bcrypt = require("bcryptjs");
const { connectToDatabase, closeDatabase } = require("./db");

const STAFF_USERS = [
  {
    username: "outreach",
    email: "outreach@fintechcalgary.ca",
    password: "outreach123",
    role: "outreach",
  },
  {
    username: "finance",
    email: "finance@fintechcalgary.ca",
    password: "finance123",
    role: "finance",
  },
  {
    username: "events",
    email: "events@fintechcalgary.ca",
    password: "events123",
    role: "events",
  },
  {
    username: "marketing",
    email: "marketing@fintechcalgary.ca",
    password: "marketing123",
    role: "marketing",
  },
];

async function seedStaffRoles() {
  const db = await connectToDatabase();
  const users = db.collection("users");

  for (const user of STAFF_USERS) {
    const existing = await users.findOne({ username: user.username });
    if (existing) {
      console.log(`User "${user.username}" already exists — skipping`);
      continue;
    }

    await users.insertOne({
      username: user.username,
      email: user.email,
      password: bcrypt.hashSync(user.password, 10),
      role: user.role,
      createdAt: new Date(),
    });

    console.log(`Created ${user.role} user: ${user.username} / ${user.password}`);
  }

  await closeDatabase();
  console.log("Staff role seeding complete.");
}

seedStaffRoles().catch((err) => {
  console.error(err);
  process.exit(1);
});
