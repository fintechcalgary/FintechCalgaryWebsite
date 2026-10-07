/**
 * List staff accounts in the users collection with their privileges.
 * Loads MONGODB_URI from .env (or .env.local).
 * Excludes associate/member partner accounts by default.
 *
 * Usage:
 *   npm run list-users
 *   npm run list-users -- --all
 */
const path = require("path");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

const root = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local"), override: false });

const uri =
  process.env.MONGODB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  process.env.NEXT_MONGODB_URI;

const DB_NAME = "fintech-website";

const STAFF_ROLES = [
  "admin",
  "outreach",
  "finance",
  "events",
  "marketing",
  "projects",
];

const ROLE_PRIVILEGES = {
  admin: "Full access — all dashboard areas and settings",
  outreach: "Contracts; Community board",
  finance: "Documentation (view); Finance folder upload/delete",
  events: "Events management",
  marketing: "Partners; Marketing Submissions (not approvals)",
  projects: "Executive Applications only",
};

async function main() {
  if (!uri) {
    console.error(
      "No MongoDB URI found. Set MONGODB_URI in .env or .env.local",
    );
    process.exit(1);
  }

  const includeAll = process.argv.includes("--all");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(DB_NAME);

  const filter = includeAll ? {} : { role: { $in: STAFF_ROLES } };
  const users = await db
    .collection("users")
    .find(filter, { projection: { password: 0 } })
    .sort({ role: 1, username: 1, email: 1 })
    .toArray();

  const label = includeAll ? "account(s)" : "staff account(s)";
  console.log(`Found ${users.length} ${label} in ${DB_NAME}.users\n`);

  if (users.length === 0) {
    await client.close();
    return;
  }

  const rows = users.map((u) => ({
    username: u.username || "—",
    email: u.email || "—",
    role: u.role || "—",
    privileges: ROLE_PRIVILEGES[u.role] || "No staff privileges",
    id: String(u._id),
  }));

  const widths = {
    username: Math.max(8, ...rows.map((r) => r.username.length)),
    role: Math.max(4, ...rows.map((r) => r.role.length)),
    privileges: Math.max(10, ...rows.map((r) => r.privileges.length)),
  };

  const header = `${"USERNAME".padEnd(widths.username)}  ${"ROLE".padEnd(widths.role)}  ${"PRIVILEGES".padEnd(widths.privileges)}`;
  console.log(header);
  console.log("-".repeat(header.length));
  for (const row of rows) {
    console.log(
      `${row.username.padEnd(widths.username)}  ${row.role.padEnd(widths.role)}  ${row.privileges}`,
    );
  }

  await client.close();
}

main().catch((error) => {
  console.error("Failed to list users:", error.message || error);
  process.exit(1);
});
