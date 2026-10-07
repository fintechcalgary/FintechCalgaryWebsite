/**
 * Seed all staff RBAC role accounts
 * (Admin, Outreach, Finance, Events, Marketing, Projects).
 * Creates missing users and updates existing ones (role; password unless preservePassword).
 * Usage: npm run seed-staff-roles
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { connectToDatabase, closeDatabase } = require("./db");
const { STAFF_USERS } = require("./staff-users");

async function seedStaffRoles() {
  const db = await connectToDatabase();
  const users = db.collection("users");

  let created = 0;
  let updated = 0;

  for (const user of STAFF_USERS) {
    const existing = await users.findOne({ username: user.username });

    if (existing) {
      const $set = { role: user.role };
      if (!user.preservePassword) {
        $set.password = bcrypt.hashSync(user.password, 10);
      }

      await users.updateOne(
        { username: user.username },
        {
          $set,
          $unset: { email: "" },
        },
      );

      const passwordNote = user.preservePassword
        ? "(password preserved)"
        : `/ ${user.password}`;
      console.log(
        `Updated ${user.role} user: ${user.username} ${passwordNote} (email removed)`,
      );
      updated += 1;
      continue;
    }

    await users.insertOne({
      username: user.username,
      password: bcrypt.hashSync(user.password, 10),
      role: user.role,
      createdAt: new Date(),
    });

    console.log(
      `Created ${user.role} user: ${user.username} / ${user.password}`,
    );
    created += 1;
  }

  await closeDatabase();
  console.log(
    `\nStaff role seeding complete. Created: ${created}, updated: ${updated}.`,
  );
}

seedStaffRoles().catch(async (err) => {
  console.error(err);
  await closeDatabase();
  process.exit(1);
});
